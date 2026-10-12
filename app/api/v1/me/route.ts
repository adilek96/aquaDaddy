import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { badRequest, getApiUser, notFound, unauthorized } from "@/lib/apiAuth";
import { isCountryCode } from "@/lib/countries";
import { bumpCacheVersion } from "@/lib/redis";

/** Текущий пользователь без пароля — для синхронизации профиля в приложении. */
export async function GET(req: Request) {
  const apiUser = await getApiUser(req);
  if (!apiUser) {
    return unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: apiUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      country: true,
    },
  });

  if (!user) {
    return notFound();
  }

  return NextResponse.json(user);
}

/**
 * Правка профиля из приложения. Сейчас — только страна: её выбирают в профиле
 * и показывают флагом рядом с публичными аквариумами, поэтому после записи
 * сбрасываем кэш «Обзора» — так же, как в веб-экшене updateCountry.
 */
export async function PATCH(req: Request) {
  const apiUser = await getApiUser(req);
  if (!apiUser) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const { country } = (body ?? {}) as { country?: unknown };

  if (typeof country !== "string" || !isCountryCode(country)) {
    return badRequest("Unknown country code");
  }

  const user = await prisma.user.update({
    where: { id: apiUser.id },
    data: { country: country.toUpperCase() },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      country: true,
    },
  });

  await bumpCacheVersion("discovery");

  return NextResponse.json(user);
}
