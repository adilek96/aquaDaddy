import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { refreshAquariumImages } from "@/lib/minio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "20");
  const search = searchParams.get("search") || "";

  const aquariums = await prisma.aquarium.findMany({
    where: {
      isPublic: true,
      name: { contains: search, mode: "insensitive" },
    },
    include: {
      images: { take: 1 },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      ratings: true,
      _count: {
        select: {
          comments: true,
          ratings: true,
        },
      },
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });

  // Ссылки в базе подписаны на 7 дней, поэтому обновляем их при выдаче
  return NextResponse.json(await refreshAquariumImages(aquariums));
}
