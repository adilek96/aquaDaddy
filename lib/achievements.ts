import { prisma } from "@/lib/prisma";
import { getInhabitants } from "@/lib/wiki";
import { groupOf } from "@/lib/wikiTemplate";

/**
 * Геймификация. Каталог наград (категория + порог) хранится в БД
 * (модель AchievementDef) и редактируется из админки. Метрика каждой категории
 * вычисляется кодом (ниже), поэтому category ограничена известным набором.
 * В Achievement лежит только факт получения по ключу `${CATEGORY}_${threshold}`.
 * Начисление идемпотентно и срабатывает и при действии, и при чтении экрана.
 */

export type AchievementCategory =
  | "inhabitants"
  | "plants"
  | "maintenance"
  | "checkins";

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  "inhabitants",
  "plants",
  "maintenance",
  "checkins",
];

const KNOWN_CATEGORIES = new Set<string>(ACHIEVEMENT_CATEGORIES);

export type AchievementDef = {
  key: string;
  category: AchievementCategory;
  threshold: number;
};

export function achievementKey(category: string, threshold: number): string {
  return `${category.toUpperCase()}_${threshold}`;
}

/** Исходный каталог — для первичного заполнения БД и как запас, если таблица пуста. */
const SEED_BASE: { category: AchievementCategory; threshold: number }[] = [
  { category: "inhabitants", threshold: 1 },
  { category: "inhabitants", threshold: 10 },
  { category: "inhabitants", threshold: 25 },
  { category: "inhabitants", threshold: 50 },
  { category: "plants", threshold: 1 },
  { category: "plants", threshold: 10 },
  { category: "plants", threshold: 25 },
  { category: "maintenance", threshold: 1 },
  { category: "maintenance", threshold: 10 },
  { category: "maintenance", threshold: 50 },
  { category: "checkins", threshold: 1 },
  { category: "checkins", threshold: 10 },
  { category: "checkins", threshold: 25 },
];

export const SEED_ACHIEVEMENTS: AchievementDef[] = SEED_BASE.map((d) => ({
  ...d,
  key: achievementKey(d.category, d.threshold),
}));

/** Активные определения наград из БД (или сид, если таблица пуста/недоступна). */
export async function getDefinitions(): Promise<AchievementDef[]> {
  try {
    const rows = await prisma.achievementDef.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { threshold: "asc" }],
    });
    const defs = rows
      .filter((r) => KNOWN_CATEGORIES.has(r.category))
      .map((r) => ({
        key: r.key,
        category: r.category as AchievementCategory,
        threshold: r.threshold,
      }));
    if (defs.length > 0) return defs;
  } catch (error) {
    console.error("Не удалось загрузить каталог наград, использую сид:", error);
  }
  return SEED_ACHIEVEMENTS;
}

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
 * и сверяем с множеством id растений из вики. Если вики недоступна — 0.
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
 * Начисляет недостающие награды. Идемпотентно. Возвращает только что выданные
 * (для уведомления). Можно передать уже посчитанную статистику.
 */
export async function syncAchievements(
  userId: string,
  precomputed?: UserStats
): Promise<AchievementDef[]> {
  const stats = precomputed ?? (await computeUserStats(userId));
  const defs = await getDefinitions();

  const qualified = defs.filter((a) => (stats[a.category] ?? 0) >= a.threshold);
  if (qualified.length === 0) return [];

  const existing = await prisma.achievement.findMany({
    where: { userId, key: { in: qualified.map((q) => q.key) } },
    select: { key: true },
  });
  const have = new Set(existing.map((e) => e.key));
  const toCreate = qualified.filter((q) => !have.has(q.key));
  if (toCreate.length === 0) return [];

  await prisma.achievement.createMany({
    data: toCreate.map((d) => ({ userId, key: d.key })),
    skipDuplicates: true,
  });
  return toCreate;
}

/**
 * Начисляет награды при действии и возвращает только что открытые (для тоста).
 * Не должна ломать само действие — при ошибке возвращает пустой список.
 */
export async function awardAchievementsSafe(
  userId: string
): Promise<AchievementDef[]> {
  try {
    return await syncAchievements(userId);
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
  const newlyEarnedDefs = await syncAchievements(userId, stats);

  const defs = await getDefinitions();
  const earned = await prisma.achievement.findMany({ where: { userId } });
  const earnedMap = new Map(earned.map((e) => [e.key, e.earnedAt]));

  const items: AchievementState[] = defs.map((a) => ({
    ...a,
    earned: earnedMap.has(a.key),
    earnedAt: earnedMap.get(a.key)?.toISOString() ?? null,
    progress: stats[a.category],
  }));

  return { stats, items, newlyEarned: newlyEarnedDefs.map((d) => d.key) };
}
