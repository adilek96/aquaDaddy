import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";
import { pickAquariumInput } from "@/lib/aquariumInput";
import { refreshImageUrls } from "@/lib/minio";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  const aquarium = await prisma.aquarium.findUnique({
    where: { id },
    include: {
      images: true,
      inhabitants: true,
      maintenance: {
        orderBy: { performedAt: "desc" },
        take: 10,
      },
      reminders: {
        where: { isCompleted: false },
        orderBy: { remindAt: "asc" },
      },
      waterLogs: {
        orderBy: { recordedAt: "desc" },
        take: 10,
      },
      waterParams: true,
    },
  });

  // Чужой аквариум отдаём только если он публичный
  if (!aquarium || (aquarium.userId !== user.id && !aquarium.isPublic)) {
    return notFound();
  }

  // Ссылки в базе подписаны на 7 дней, поэтому обновляем их при выдаче
  return NextResponse.json({
    ...aquarium,
    images: await refreshImageUrls(aquarium.images),
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  try {
    const data = pickAquariumInput(await req.json());

    const { count } = await prisma.aquarium.updateMany({
      where: { id, userId: user.id },
      data,
    });

    if (count === 0) {
      return notFound();
    }

    const updated = await prisma.aquarium.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Failed to update"
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;

  const { count } = await prisma.aquarium.deleteMany({
    where: { id, userId: user.id },
  });

  if (count === 0) {
    return notFound();
  }

  return NextResponse.json({ success: true });
}
