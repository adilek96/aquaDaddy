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

  const reminders = await prisma.reminder.findMany({
    where: {
      aquariumId,
      aquarium: { userId: user.id },
    },
    orderBy: { remindAt: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const { title, remindAt } = await req.json();

  if (typeof title !== "string" || title.trim().length === 0) {
    return badRequest("Требуется заголовок напоминания");
  }

  const remindDate = new Date(remindAt);
  if (Number.isNaN(remindDate.getTime())) {
    return badRequest("Поле remindAt должно быть корректной датой");
  }

  const aquarium = await prisma.aquarium.findFirst({
    where: { id: aquariumId, userId: user.id },
    select: { id: true },
  });

  if (!aquarium) {
    return notFound("Аквариум не найден");
  }

  const reminder = await prisma.reminder.create({
    data: {
      aquariumId,
      title: title.trim(),
      remindAt: remindDate,
    },
  });

  return NextResponse.json(reminder, { status: 201 });
}
