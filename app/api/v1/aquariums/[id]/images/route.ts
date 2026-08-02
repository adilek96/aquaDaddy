import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;

  const aquarium = await prisma.aquarium.findFirst({
    where: { id: aquariumId, userId: user.id },
    select: { id: true },
  });

  if (!aquarium) {
    return notFound("Аквариум не найден");
  }

  const { url } = await req.json();

  if (typeof url !== "string" || url.trim().length === 0) {
    return badRequest("Требуется url изображения");
  }

  const image = await prisma.aquariumImage.create({
    data: { aquariumId, url: url.trim() },
  });

  return NextResponse.json(image, { status: 201 });
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const imageId = new URL(req.url).searchParams.get("imageId");

  if (!imageId) {
    return badRequest("Требуется параметр imageId");
  }

  const { count } = await prisma.aquariumImage.deleteMany({
    where: {
      id: imageId,
      aquariumId,
      aquarium: { userId: user.id },
    },
  });

  if (count === 0) {
    return notFound("Изображение не найдено");
  }

  return new NextResponse(null, { status: 204 });
}
