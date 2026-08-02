import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ id: string }> };

/** Замеры воды, которые клиент может прислать. */
const MEASUREMENTS = [
  "pH",
  "temperatureC",
  "NO2",
  "NO3",
  "NH3",
  "NH4",
  "PO4",
  "GH",
  "KH",
  "Ca",
  "Mg",
  "K",
  "Fe",
  "salinity",
] as const;

type Measurements = Partial<Record<(typeof MEASUREMENTS)[number], number | null>>;

function pickMeasurements(body: Record<string, unknown>): Measurements {
  const result: Measurements = {};

  for (const field of MEASUREMENTS) {
    const value = body[field];
    if (value === undefined) continue;
    if (value === null) {
      result[field] = null;
      continue;
    }
    const num = typeof value === "string" ? Number(value) : value;
    if (typeof num !== "number" || Number.isNaN(num)) {
      throw new Error(`Поле ${field} должно быть числом`);
    }
    result[field] = num;
  }

  return result;
}

export async function GET(req: Request, { params }: RouteContext) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { id: aquariumId } = await params;

  const logs = await prisma.waterLog.findMany({
    where: {
      aquariumId,
      aquarium: { userId: user.id },
    },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}

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

  let measurements: Measurements;
  let recordedAt: Date;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    measurements = pickMeasurements(body);

    recordedAt = body.recordedAt
      ? new Date(body.recordedAt as string)
      : new Date();

    if (Number.isNaN(recordedAt.getTime())) {
      throw new Error("Поле recordedAt должно быть корректной датой");
    }
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Некорректное тело запроса"
    );
  }

  // В журнале null означает «не измеряли», но текущие параметры аквариума
  // затирать этим нельзя: замер одного pH не должен стирать температуру
  const measured = Object.fromEntries(
    Object.entries(measurements).filter(([, value]) => value !== null)
  );

  // Запись в журнал и обновление текущих параметров — одной транзакцией,
  // чтобы карточка аквариума не разъехалась с историей замеров
  const [log] = await prisma.$transaction([
    prisma.waterLog.create({
      data: { aquariumId, recordedAt, ...measurements },
    }),
    prisma.waterParameters.upsert({
      where: { aquariumId },
      update: { ...measured, lastUpdated: new Date() },
      create: { aquariumId, ...measured },
    }),
  ]);

  return NextResponse.json(log, { status: 201 });
}
