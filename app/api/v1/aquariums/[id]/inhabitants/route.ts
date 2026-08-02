import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;

  const inhabitants = await prisma.inhabitant.findMany({
    where: {
      aquariumId,
      aquarium: { userId: user.id },
    },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json(inhabitants);
}

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const { species, count } = await req.json();

  if (typeof species !== "string" || species.trim().length === 0) {
    return badRequest("Требуется название вида");
  }

  const parsedCount = Number(count);
  if (!Number.isInteger(parsedCount) || parsedCount < 1) {
    return badRequest("Количество должно быть целым числом больше нуля");
  }

  const aquarium = await prisma.aquarium.findFirst({
    where: { id: aquariumId, userId: user.id },
    select: { id: true },
  });

  if (!aquarium) {
    return notFound("Аквариум не найден");
  }

  const inhabitant = await prisma.inhabitant.create({
    data: {
      aquariumId,
      species: species.trim(),
      count: parsedCount,
    },
  });

  return NextResponse.json(inhabitant, { status: 201 });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const inhabitantId = new URL(req.url).searchParams.get("inhabitantId");

  if (!inhabitantId) {
    return badRequest("Требуется параметр inhabitantId");
  }

  const { count } = await prisma.inhabitant.deleteMany({
    where: {
      id: inhabitantId,
      aquariumId,
      aquarium: { userId: user.id },
    },
  });

  if (count === 0) {
    return notFound("Обитатель не найден");
  }

  return new NextResponse(null, { status: 204 });
}
