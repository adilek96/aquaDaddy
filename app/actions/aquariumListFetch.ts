"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { refreshImageUrls } from "@/lib/minio";
import { Prisma } from "@prisma/client";

export async function fetchAquariums({ search = "" }: { search?: string; userId?: string }) {
  // userId раньше приходил параметром: подставив чужой, можно было получить
  // весь список его аквариумов, включая приватные. Берём из сессии.
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return [];
  }

  const where: Prisma.AquariumWhereInput = { userId };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const aquariums = await prisma.aquarium.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
      reminders: true,
      maintenance: true
    }
  });

  // Преобразуем даты в строки для сериализации
  return Promise.all(
    aquariums.map(async aquarium => ({
      ...aquarium,
      startDate: aquarium.startDate ? aquarium.startDate.toISOString() : null,
      createdAt: aquarium.createdAt.toISOString(),
      updatedAt: aquarium.updatedAt.toISOString(),
      // Подпись ссылки живёт 7 дней, а в базе она хранится постоянно
      images: (await refreshImageUrls(aquarium.images)).map(img => ({
        ...img,
        uploadedAt: img.uploadedAt.toISOString(),
      })),
      reminders: aquarium.reminders.map(r => ({
        ...r,
        remindAt: r.remindAt.toISOString(),
      })),
      maintenance: aquarium.maintenance.map(m => ({
        ...m,
        performedAt: m.performedAt.toISOString(),
      })),
    }))
  );
}
