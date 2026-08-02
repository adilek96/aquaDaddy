import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = {
  params: Promise<{ id: string; reminderId: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId, reminderId } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const data: { title?: string; remindAt?: Date; isCompleted?: boolean } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return badRequest("Заголовок не может быть пустым");
    }
    data.title = body.title.trim();
  }

  if (body.remindAt !== undefined) {
    const remindDate = new Date(body.remindAt as string);
    if (Number.isNaN(remindDate.getTime())) {
      return badRequest("Поле remindAt должно быть корректной датой");
    }
    data.remindAt = remindDate;
  }

  if (body.isCompleted !== undefined) {
    if (typeof body.isCompleted !== "boolean") {
      return badRequest("Поле isCompleted должно быть true или false");
    }
    data.isCompleted = body.isCompleted;
  }

  if (Object.keys(data).length === 0) {
    return badRequest("Нечего обновлять");
  }

  const { count } = await prisma.reminder.updateMany({
    where: {
      id: reminderId,
      aquariumId,
      aquarium: { userId: user.id },
    },
    data,
  });

  if (count === 0) {
    return notFound("Напоминание не найдено");
  }

  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
  });

  return NextResponse.json(reminder);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId, reminderId } = await params;

  const { count } = await prisma.reminder.deleteMany({
    where: {
      id: reminderId,
      aquariumId,
      aquarium: { userId: user.id },
    },
  });

  if (count === 0) {
    return notFound("Напоминание не найдено");
  }

  return new NextResponse(null, { status: 204 });
}
