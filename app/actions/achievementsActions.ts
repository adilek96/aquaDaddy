"use server";

import { auth } from "@/auth";
import { getAchievementsState } from "@/lib/achievements";

/**
 * Награды текущего пользователя для экрана «Награды». Попутно досчитывает и
 * начисляет недостающие (на случай, если действия шли мимо веба — например
 * из мобильного приложения).
 */
export async function getMyAchievements() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getAchievementsState(session.user.id);
}
