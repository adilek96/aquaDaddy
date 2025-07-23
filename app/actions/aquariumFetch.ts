"use server";
import { prisma } from "@/lib/prisma";

export async function fetchUserAquarium({  tankId }: {   tankId: string }) {
  const where: any = {id: tankId };
  
 

  const aquarium = await prisma.aquarium.findUnique({
    where,
    include: {
      images: true,
      waterParams: true,
      inhabitants: true,
      maintenance: true,
      reminders: true,
      ratings: true,
      waterLogs: true
    }
  });

  // Преобразуем даты в строки для сериализации
  if (aquarium) {
    return {
      ...aquarium,
      startDate: aquarium.startDate ? aquarium.startDate.toISOString() : null,
      createdAt: aquarium.createdAt.toISOString(),
      updatedAt: aquarium.updatedAt.toISOString(),
      // Обрабатываем связанные модели с датами
      waterParams: aquarium.waterParams ? {
        ...aquarium.waterParams,
        lastUpdated: aquarium.waterParams.lastUpdated.toISOString(),
      } : null,
      maintenance: aquarium.maintenance.map(m => ({
        ...m,
        performedAt: m.performedAt.toISOString(),
      })),
      reminders: aquarium.reminders.map(r => ({
        ...r,
        remindAt: r.remindAt.toISOString(),
      })),
    };
  }

  return aquarium;
} 