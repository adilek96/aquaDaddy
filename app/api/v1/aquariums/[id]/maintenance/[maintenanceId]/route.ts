import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";
import { MaintenanceStatus, MaintenanceType, Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string; maintenanceId: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId, maintenanceId } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const data: Prisma.MaintenanceUncheckedUpdateInput = {};

  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length === 0
    ) {
      return badRequest("Описание не может быть пустым");
    }
    data.description = body.description.trim();
  }

  if (body.performedAt !== undefined) {
    const performedAt = new Date(body.performedAt as string);
    if (Number.isNaN(performedAt.getTime())) {
      return badRequest("Поле performedAt должно быть корректной датой");
    }
    data.performedAt = performedAt;
  }

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!(status in MaintenanceStatus)) {
      return badRequest(
        `Недопустимый статус: ${body.status}. Допустимые: ${Object.keys(
          MaintenanceStatus
        ).join(", ")}`
      );
    }
    data.status = status as MaintenanceStatus;
  }

  if (body.type !== undefined) {
    if (!Array.isArray(body.type) || body.type.length === 0) {
      return badRequest("Поле type должно быть непустым массивом");
    }
    const invalid = body.type.find((item) => !(item in MaintenanceType));
    if (invalid) {
      return badRequest(
        `Недопустимый тип работы: ${invalid}. Допустимые: ${Object.keys(
          MaintenanceType
        ).join(", ")}`
      );
    }
    data.type = body.type as MaintenanceType[];
  }

  if (Object.keys(data).length === 0) {
    return badRequest("Нечего обновлять");
  }

  const { count } = await prisma.maintenance.updateMany({
    where: {
      id: maintenanceId,
      aquariumId,
      aquarium: { userId: user.id },
    },
    data,
  });

  if (count === 0) {
    return notFound("Запись обслуживания не найдена");
  }

  const record = await prisma.maintenance.findUnique({
    where: { id: maintenanceId },
  });

  return NextResponse.json(record);
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId, maintenanceId } = await params;

  // Замеры воды могут ссылаться на эту запись — связь обнуляем,
  // чтобы удаление не падало на внешнем ключе и история не терялась
  await prisma.waterLog.updateMany({
    where: { maintenanceId, aquariumId },
    data: { maintenanceId: null },
  });

  const { count } = await prisma.maintenance.deleteMany({
    where: {
      id: maintenanceId,
      aquariumId,
      aquarium: { userId: user.id },
    },
  });

  if (count === 0) {
    return notFound("Запись обслуживания не найдена");
  }

  return new NextResponse(null, { status: 204 });
}
