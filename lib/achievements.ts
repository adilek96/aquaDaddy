import { prisma } from "@/lib/prisma";
import { getInhabitants } from "@/lib/wiki";
import { groupOf } from "@/lib/wikiTemplate";

/**
 * Геймификация: каталог наград и их пороги заданы здесь, в коде. В базе
 * (модель Achievement) лежит только факт получения награды по ключу — чтобы
 * помнить дату и не выдавать повторно. Начисление идемпотентно и может
 * вызываться и при действии (добавил обитателя), и при чтении экрана наград —
 * так награда появится независимо от того, через веб или мобилку шло действие.
 */

export type AchievementCategory =
  | "inhabitants"
  | "plants"
  | "maintenance"
  | "checkins";

export type AchievementDef = {
  key: string;
  category: AchievementCategory;
  threshold: number;
};

// Пороги внутри категории — по возрастанию.
export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "INHABITANTS_1", category: "inhabitants", threshold: 1 },
  { key: "INHABITANTS_10", category: "inhabitants", threshold: 10 },
  { key: "INHABITANTS_25", category: "inhabitants", threshold: 25 },
  { key: "INHABITANTS_50", category: "inhabitants", threshold: 50 },
  { key: "PLANTS_1", category: "plants", threshold: 1 },
  { key: "PLANTS_10", category: "plants", threshold: 10 },
  { key: "PLANTS_25", category: "plants", threshold: 25 },
  { key: "MAINTENANCE_1", category: "maintenance", threshold: 1 },
  { key: "MAINTENANCE_10", category: "maintenance", threshold: 10 },
  { key: "MAINTENANCE_50", category: "maintenance", threshold: 50 },
  { key: "CHECKINS_1", category: "checkins", threshold: 1 },
  { key: "CHECKINS_10", category: "checkins", threshold: 10 },
  { key: "CHECKINS_25", category: "checkins", threshold: 25 },
];

export type UserStats = Record<AchievementCategory, number>;

export async function computeUserStats(userId: string): Promise<UserStats> {
  const [inhabitants, maintenance, checkins, plants] = await Promise.all([
    prisma.inhabitant.count({ where: { aquarium: { userId } } }),
    prisma.maintenance.count({
      where: { aquarium: { userId }, status: "COMPLETED" },
    }),
    prisma.reminder.count({
      where: { aquarium: { userId }, isCompleted: true },
    }),
    countPlants(userId),
  ]);
  return { inhabitants, plants, maintenance, checkins };
}

/**
 * Категория обитателя (рыбы/растения/…) хранится в энциклопедии, а в записи
 * аквариума — только wikiId. Поэтому берём wikiId пользовательских обитателей
 * и сверяем с множеством id растений из вики. Если вики недоступна —
 * считаем 0, чтобы сохранение/экран не падали.
 */
async function countPlants(userId: string): Promise<number> {
  const rows = await prisma.inhabitant.findMany({
    where: { aquarium: { userId }, wikiId: { not: null } },
    select: { wikiId: true },
  });
  if (rows.length === 0) return 0;

  try {
    const list = await getInhabitants("en", undefined, {
      includeVarieties: true,
    });
    const plantIds = new Set(
      list.filter((i) => groupOf(i.subtype) === "PLANT").map((i) => i.id)
    );
    return rows.filter((r) => r.wikiId && plantIds.has(r.wikiId)).length;
  } catch (error) {
    console.error("Не удалось определить растения для наград:", error);
    return 0;
  }
}

/**
 * Начисляет недостающие награды. Идемпотентно. Возвращает ключи только что
 * выданных наград (для уведомления). Можно передать уже посчитанную статистику.
 */
export async function syncAchievements(
  userId: string,
  precomputed?: UserStats
): Promise<string[]> {
  const stats = precomputed ?? (await computeUserStats(userId));

  const earnedKeys = ACHIEVEMENTS.filter(
    (a) => stats[a.category] >= a.threshold
  ).map((a) => a.key);
  if (earnedKeys.length === 0) return [];

  const existing = await prisma.achievement.findMany({
    where: { userId, key: { in: earnedKeys } },
    select: { key: true },
  });
  const have = new Set(existing.map((e) => e.key));
  const toCreate = earnedKeys.filter((k) => !have.has(k));
  if (toCreate.length === 0) return [];

  await prisma.achievement.createMany({
    data: toCreate.map((key) => ({ userId, key })),
    skipDuplicates: true,
  });
  return toCreate;
}

const ACHIEVEMENT_BY_KEY = new Map(ACHIEVEMENTS.map((a) => [a.key, a]));

/**
 * Начисляет награды при действии и возвращает только что открытые (для тоста).
 * Не должна ломать само действие — при ошибке возвращает пустой список.
 */
export async function awardAchievementsSafe(
  userId: string
): Promise<AchievementDef[]> {
  try {
    const keys = await syncAchievements(userId);
    return keys
      .map((k) => ACHIEVEMENT_BY_KEY.get(k))
      .filter((a): a is AchievementDef => Boolean(a));
  } catch (error) {
    console.error("Не удалось начислить награды:", error);
    return [];
  }
}

export type AchievementState = AchievementDef & {
  earned: boolean;
  earnedAt: string | null;
  progress: number;
};

/** Синхронизирует и отдаёт весь каталог с прогрессом — для экрана наград. */
export async function getAchievementsState(userId: string): Promise<{
  stats: UserStats;
  items: AchievementState[];
  newlyEarned: string[];
}> {
  const stats = await computeUserStats(userId);
  const newlyEarned = await syncAchievements(userId, stats);

  const earned = await prisma.achievement.findMany({ where: { userId } });
  const earnedMap = new Map(earned.map((e) => [e.key, e.earnedAt]));

  const items: AchievementState[] = ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: earnedMap.has(a.key),
    earnedAt: earnedMap.get(a.key)?.toISOString() ?? null,
    progress: stats[a.category],
  }));

  return { stats, items, newlyEarned };
}
