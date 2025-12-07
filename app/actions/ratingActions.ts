"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addOrUpdateRating(aquariumId: string, value: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Проверяем, что значение в диапазоне 1-10
    if (value < 1 || value > 10) {
      return { success: false, error: "Rating must be between 1 and 10" };
    }

    // Проверяем, что аквариум публичный
    const aquarium = await prisma.aquarium.findUnique({
      where: { id: aquariumId },
      select: { isPublic: true, userId: true },
    });

    if (!aquarium) {
      return { success: false, error: "Aquarium not found" };
    }

    if (!aquarium.isPublic) {
      return { success: false, error: "Aquarium is not public" };
    }

    // Нельзя оценивать свой собственный аквариум
    if (aquarium.userId === session.user.id) {
      return { success: false, error: "Cannot rate your own aquarium" };
    }

    // Создаем или обновляем рейтинг
    const rating = await prisma.rating.upsert({
      where: {
        userId_aquariumId: {
          userId: session.user.id,
          aquariumId,
        },
      },
      update: {
        value,
      },
      create: {
        userId: session.user.id,
        aquariumId,
        value,
      },
    });

    // Не используем revalidatePath для избежания перезагрузки страницы
    // revalidatePath("/discovery");
    // revalidatePath(`/discovery/${aquariumId}`);

    return { success: true, data: rating };
  } catch (error) {
    console.error("Error adding/updating rating:", error);
    return { success: false, error: "Failed to add rating" };
  }
}

export async function getUserRating(aquariumId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const rating = await prisma.rating.findUnique({
      where: {
        userId_aquariumId: {
          userId: session.user.id,
          aquariumId,
        },
      },
    });

    return rating;
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return null;
  }
}
