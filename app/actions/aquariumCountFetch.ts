"use server";
import { prisma } from "@/lib/prisma";

export async function fetchAquariumCount(userId: string): Promise<number> {
  try {
    const count = await prisma.aquarium.count({
      where: { userId },
    });
    return count;
  } catch (error) {
    console.error("Error fetching aquarium count:", error);
    return 0;
  }
}
