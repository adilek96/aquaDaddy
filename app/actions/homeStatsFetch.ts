"use server";
import { prisma } from "@/lib/prisma";

export type HomeStats = {
  /** Аквариумов у текущего пользователя (null — пользователь не авторизован) */
  aquariums: number | null;
  /** Незакрытых обслуживаний на ближайшие 7 дней */
  upcomingMaintenance: number | null;
  /** Публичных аквариумов в сообществе — для карточки Discovery */
  publicAquariums: number;
};

/**
 * Считает всё для главной одним заходом. Раньше числа на карточках Wiki и
 * Discovery были захардкожены (250 и 1000), а количество аквариумов
 * догружалось отдельным запросом уже после гидрации.
 */
export async function fetchHomeStats(userId?: string): Promise<HomeStats> {
  try {
    const weekAhead = new Date();
    weekAhead.setDate(weekAhead.getDate() + 7);

    const [aquariums, upcomingMaintenance, publicAquariums] = await Promise.all([
      userId ? prisma.aquarium.count({ where: { userId } }) : Promise.resolve(null),
      userId
        ? prisma.maintenance.count({
            where: {
              status: "PENDING",
              performedAt: { gte: new Date(), lte: weekAhead },
              aquarium: { userId },
            },
          })
        : Promise.resolve(null),
      prisma.aquarium.count({ where: { isPublic: true } }),
    ]);

    return { aquariums, upcomingMaintenance, publicAquariums };
  } catch (error) {
    console.error("Error fetching home stats:", error);
    return { aquariums: null, upcomingMaintenance: null, publicAquariums: 0 };
  }
}
