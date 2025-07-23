"use server";
import { prisma } from "@/lib/prisma";

export async function fetchUserAquarium({  tankId }: {   tankId: string }) {
  const where: any = {id: tankId };
  
 

  const aquariums = await prisma.aquarium.findUnique({
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

  return aquariums;
} 