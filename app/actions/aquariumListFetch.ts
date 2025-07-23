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
      images: true
    }
  });

  return aquariums;
} 