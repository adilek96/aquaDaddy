"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { refreshImageUrls } from "@/lib/minio";

export async function fetchUserAquarium({  tankId }: {   tankId: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  // Раньше по одному id отдавался любой аквариум, включая приватный —
  // вместе с замерами, обитателями и напоминаниями владельца
  const where = userId
    ? { id: tankId, OR: [{ userId }, { isPublic: true }] }
    : { id: tankId, isPublic: true };

  const aquarium = await prisma.aquarium.findFirst({
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
      // Подпись ссылки живёт 7 дней, а в базе она хранится постоянно
      images: (await refreshImageUrls(aquarium.images)).map(img => ({
        ...img,
        uploadedAt: img.uploadedAt.toISOString(),
      })),
    };
  }

  return aquarium;
} 