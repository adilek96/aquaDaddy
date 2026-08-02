import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";
import { MaintenanceStatus, MaintenanceType } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;

  const maintenance = await prisma.maintenance.findMany({
    where: {
      aquariumId,
      aquarium: { userId: user.id },
    },
    orderBy: { performedAt: "desc" },
  });

  return NextResponse.json(maintenance);
}

export async function POST(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;
  const { description, performedAt, type, status } = await req.json();

  if (typeof description !== "string" || description.trim().length === 0) {
    return badRequest("Требуется описание работы");
  }

  const types: MaintenanceType[] = Array.isArray(type) && type.length > 0
    ? type
    : [MaintenanceType.OTHER];

  const invalidType = types.find((item) => !(item in MaintenanceType));
  if (invalidType) {
    return badRequest(
      `Недопустимый тип работы: ${invalidType}. Допустимые: ${Object.keys(
        MaintenanceType
      ).join(", ")}`
    );
  }

  if (status && !(status in MaintenanceStatus)) {
    return badRequest(
      `Недопустимый статус: ${status}. Допустимые: ${Object.keys(
        MaintenanceStatus
      ).join(", ")}`
    );
  }

  const performedDate = performedAt ? new Date(performedAt) : new Date();
  if (Number.isNaN(performedDate.getTime())) {
    return badRequest("Поле performedAt должно быть корректной датой");
  }

  const aquarium = await prisma.aquarium.findFirst({
    where: { id: aquariumId, userId: user.id },
    select: { id: true },
  });

  if (!aquarium) {
    return notFound("Аквариум не найден");
  }

  const record = await prisma.maintenance.create({
    data: {
      aquariumId,
      description: description.trim(),
      performedAt: performedDate,
      type: types,
      status: (status as MaintenanceStatus) || MaintenanceStatus.COMPLETED,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
