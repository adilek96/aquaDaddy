import { AquariumType, Prisma } from "@prisma/client";

const NUMERIC_FIELDS = [
  "lengthCm",
  "widthCm",
  "heightCm",
  "depthCm",
  "diameterCm",
  "sideCm",
  "k",
  "volumeLiters",
] as const;

/**
 * Отбирает из тела запроса только те поля, которые клиенту разрешено задавать.
 * Без этого `data: body` позволил бы выставить любую колонку, включая userId
 * и вложенные записи.
 */
export function pickAquariumInput(
  body: unknown
): Prisma.AquariumUncheckedUpdateInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Ожидался JSON-объект");
  }

  const raw = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (typeof raw.name === "string") data.name = raw.name.trim();
  if (typeof raw.description === "string" || raw.description === null) {
    data.description = raw.description;
  }
  if (typeof raw.shape === "string") data.shape = raw.shape;
  if (typeof raw.isPublic === "boolean") data.isPublic = raw.isPublic;

  if (typeof raw.type === "string") {
    if (!(raw.type in AquariumType)) {
      throw new Error(
        `Недопустимый тип аквариума: ${raw.type}. Допустимые: ${Object.keys(
          AquariumType
        ).join(", ")}`
      );
    }
    data.type = raw.type as AquariumType;
  }

  for (const field of NUMERIC_FIELDS) {
    const value = raw[field];
    if (value === undefined) continue;
    if (value === null) {
      data[field] = null;
      continue;
    }
    const num = typeof value === "string" ? Number(value) : value;
    if (typeof num !== "number" || Number.isNaN(num)) {
      throw new Error(`Поле ${field} должно быть числом`);
    }
    data[field] = num;
  }

  if (raw.startDate !== undefined) {
    if (raw.startDate === null) {
      data.startDate = null;
    } else {
      const date = new Date(raw.startDate as string);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Поле startDate должно быть корректной датой");
      }
      data.startDate = date;
    }
  }

  return data as Prisma.AquariumUncheckedUpdateInput;
}

/** Поля, без которых аквариум создать нельзя. */
export function assertCreatable(
  data: Prisma.AquariumUncheckedUpdateInput
): asserts data is Prisma.AquariumUncheckedUpdateInput & {
  name: string;
  type: AquariumType;
  shape: string;
} {
  const missing = (["name", "type", "shape"] as const).filter(
    (field) => data[field] === undefined
  );
  if (missing.length > 0) {
    throw new Error(`Не заполнены обязательные поля: ${missing.join(", ")}`);
  }
}
