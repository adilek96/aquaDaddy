import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ id: string }> };

const userPreview = {
  select: {
    id: true,
    name: true,
    image: true,
  },
} as const;

export async function GET(req: Request, { params }: RouteContext) {
  const { id: aquariumId } = await params;
  const user = await getApiUser(req);

  const aquarium = await prisma.aquarium.findUnique({
    where: { id: aquariumId },
    select: { isPublic: true, userId: true },
  });

  // Комментарии приватного аквариума видит только владелец
  if (!aquarium || (!aquarium.isPublic && aquarium.userId !== user?.id)) {
    return notFound();
  }

  const comments = await prisma.comment.findMany({
    where: { aquariumId, parentId: null },
    include: {
      user: userPreview,
      replies: {
        include: { user: userPreview },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const { text, parentId } = await req.json();

  if (typeof text !== "string" || text.trim().length === 0) {
    return badRequest("Текст комментария не может быть пустым");
  }

  const aquarium = await prisma.aquarium.findUnique({
    where: { id: aquariumId },
    select: { isPublic: true, userId: true },
  });

  if (!aquarium || (!aquarium.isPublic && aquarium.userId !== user.id)) {
    return notFound();
  }

  // Ответ должен принадлежать этому же аквариуму
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { aquariumId: true },
    });
    if (!parent || parent.aquariumId !== aquariumId) {
      return badRequest("Родительский комментарий не найден");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId: user.id,
      aquariumId,
      text: text.trim(),
      parentId: parentId ?? null,
    },
    include: { user: userPreview },
  });

  return NextResponse.json(comment, { status: 201 });
}

/**
 * Удаляет комментарий: DELETE /aquariums/{id}/comments?commentId=...
 * Удалить может автор комментария или владелец аквариума.
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const commentId = new URL(req.url).searchParams.get("commentId");

  if (!commentId) {
    return badRequest("Требуется параметр commentId");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      aquariumId: true,
      userId: true,
      aquarium: { select: { userId: true } },
    },
  });

  if (!comment || comment.aquariumId !== aquariumId) {
    return notFound("Комментарий не найден");
  }

  const canDelete =
    comment.userId === user.id || comment.aquarium.userId === user.id;

  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ответы удалятся каскадом (onDelete: Cascade на parentId)
  await prisma.comment.delete({ where: { id: commentId } });

  return new NextResponse(null, { status: 204 });
}
