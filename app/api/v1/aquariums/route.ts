import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { badRequest, getApiUser, unauthorized } from "@/lib/apiAuth";
import { assertCreatable, pickAquariumInput } from "@/lib/aquariumInput";
import { refreshAquariumImages } from "@/lib/minio";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const aquariums = await prisma.aquarium.findMany({
    where: {
      userId: user.id,
      name: { contains: search, mode: "insensitive" },
    },
    include: {
      images: true,
      waterParams: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Ссылки в базе подписаны на 7 дней, поэтому обновляем их при выдаче
  return NextResponse.json(await refreshAquariumImages(aquariums));
}

export async function POST(req: Request) {
  const user = await getApiUser(req);
  if (!user) {
    return unauthorized();
  }

  try {
    const input = pickAquariumInput(await req.json());
    assertCreatable(input);

    const aquarium = await prisma.aquarium.create({
      data: {
        ...(input as Prisma.AquariumUncheckedCreateInput),
        userId: user.id,
      },
    });
    return NextResponse.json(aquarium, { status: 201 });
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Failed to create aquarium"
    );
  }
}
