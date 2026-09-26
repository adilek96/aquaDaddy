"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { bumpCacheVersion } from "@/lib/redis";

export async function deleteAquarium(tankId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const aquarium = await prisma.aquarium.findFirst({
      where: {
        id: tankId,
        userId,
      },
    });

    if (!aquarium) {
      throw new Error("Aquarium not found or access denied");
    }

    await prisma.aquarium.delete({
      where: {
        id: tankId,
      },
    });

    // Публичные данные изменились — обнуляем кэш ленты
    await bumpCacheVersion("discovery");
    return { success: true };
  } catch (error) {
    console.error("Error deleting aquarium:", error);
    return { success: false, error: "Failed to delete aquarium" };
  }
}
