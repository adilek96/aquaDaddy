"use server";
import { prisma } from "@/lib/prisma";

export async function fetchAquariums({ search = "", userId }: { search?: string,  userId: string }) {
  const where: any = { userId };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  let orderBy: any[] = [];
  

  const aquariums = await prisma.aquarium.findMany({
    where,
    orderBy,
    include: {
      images: true,
      reminders: true
    }
  });

  // Преобразуем даты в строки для сериализации
  return aquariums.map(aquarium => ({
    ...aquarium,
    startDate: aquarium.startDate ? aquarium.startDate.toISOString() : null,
    createdAt: aquarium.createdAt.toISOString(),
    updatedAt: aquarium.updatedAt.toISOString(),
    reminders: aquarium.reminders.map(r => ({
      ...r,
      remindAt: r.remindAt.toISOString(),
    })),
  }));
} 