"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { bumpCacheVersion } from "@/lib/redis";
import { isCountryCode } from "@/lib/countries";

/**
 * Сохраняет страну пользователя.
 *
 * Страна показывается флагом рядом с аквариумами в разделе «Обзор», поэтому
 * после записи сбрасываем кэш этого раздела — иначе флаг появится только
 * через полторы минуты, когда истечёт TTL.
 */
export async function updateCountry(
  code: string
): Promise<{ success: boolean; country?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!isCountryCode(code)) {
    return { success: false, error: "Unknown country code" };
  }

  const country = code.toUpperCase();

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { country },
    });

    await bumpCacheVersion("discovery");

    return { success: true, country };
  } catch (error) {
    console.error("Не удалось сохранить страну:", error);
    return { success: false, error: "Save failed" };
  }
}
