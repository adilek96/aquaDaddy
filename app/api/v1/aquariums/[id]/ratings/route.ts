import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const { id: aquariumId } = await params;
  const user = await getApiUser(req);

  const [aggregate, userRating] = await Promise.all([
    prisma.rating.aggregate({
      where: { aquariumId },
      _avg: { value: true },
      _count: { value: true },
    }),
    user
      ? prisma.rating.findUnique({
          where: {
            userId_aquariumId: { userId: user.id, aquariumId },
          },
          select: { value: true },
        })
      : null,
  ]);

  return NextResponse.json({
    average: aggregate._avg.value ?? 0,
    count: aggregate._count.value,
    userRating: userRating?.value ?? null,
  });
}

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const { value } = await req.json();

  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return badRequest("Оценка должна быть целым числом от 1 до 5");
  }

  const aquarium = await prisma.aquarium.findUnique({
    where: { id: aquariumId },
    select: { isPublic: true, userId: true },
  });

  if (!aquarium || (!aquarium.isPublic && aquarium.userId !== user.id)) {
    return notFound("Аквариум не найден");
  }

  const saved = await prisma.rating.upsert({
    where: {
      userId_aquariumId: { userId: user.id, aquariumId },
    },
    update: { value: rating },
    create: { userId: user.id, aquariumId, value: rating },
  });

  return NextResponse.json(saved);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;

  // deleteMany вместо delete: отсутствие оценки не должно падать с 500
  await prisma.rating.deleteMany({
    where: { userId: user.id, aquariumId },
  });

  return new NextResponse(null, { status: 204 });
}
