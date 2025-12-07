"use server";
import { prisma } from "@/lib/prisma";

export type SortType = "newest" | "rating";

export async function fetchPublicAquariums({
  search = "",
  sort = "newest",
  page = 1,
  limit = 12,
  type,
}: {
  search?: string;
  sort?: SortType;
  page?: number;
  limit?: number;
  type?: string;
}) {
  const skip = (page - 1) * limit;

  const where: any = {
    isPublic: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type && type !== "all") {
    where.type = type.toUpperCase();
  }

  // Получаем аквариумы с рейтингами
  const aquariums = await prisma.aquarium.findMany({
    where,
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          country: true,
        },
      },
      images: {
        take: 1,
        orderBy: {
          uploadedAt: "desc",
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
    orderBy:
      sort === "rating"
        ? [{ ratings: { _count: "desc" } }]
        : [{ createdAt: "desc" }],
  });

  // Подсчитываем средний рейтинг для каждого аквариума
  const aquariumsWithRating = aquariums.map((aquarium) => {
    const totalRating = aquarium.ratings.reduce(
      (sum, rating) => sum + rating.value,
      0
    );
    const averageRating =
      aquarium.ratings.length > 0 ? totalRating / aquarium.ratings.length : 0;

    return {
      ...aquarium,
      averageRating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака
      ratings: undefined, // Убираем детали рейтингов из ответа
      startDate: aquarium.startDate ? aquarium.startDate.toISOString() : null,
      createdAt: aquarium.createdAt.toISOString(),
      updatedAt: aquarium.updatedAt.toISOString(),
      images: aquarium.images.map((img) => ({
        ...img,
        uploadedAt: img.uploadedAt.toISOString(),
      })),
    };
  });

  // Если сортировка по рейтингу, пересортируем по среднему рейтингу
  if (sort === "rating") {
    aquariumsWithRating.sort((a, b) => b.averageRating - a.averageRating);
  }

  const totalCount = await prisma.aquarium.count({ where });

  return {
    aquariums: aquariumsWithRating,
    totalCount,
    hasMore: skip + limit < totalCount,
  };
}

export async function fetchAquariumDetails(aquariumId: string) {
  const aquarium = await prisma.aquarium.findUnique({
    where: {
      id: aquariumId,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          country: true,
        },
      },
      images: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
      inhabitants: true,
      waterParams: true,
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      comments: {
        where: {
          parentId: null, // Только корневые комментарии
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          comments: true,
          ratings: true,
        },
      },
    },
  });

  if (!aquarium) {
    return null;
  }

  const totalRating = aquarium.ratings.reduce(
    (sum, rating) => sum + rating.value,
    0
  );
  const averageRating =
    aquarium.ratings.length > 0 ? totalRating / aquarium.ratings.length : 0;

  return {
    ...aquarium,
    averageRating: Math.round(averageRating * 10) / 10,
    startDate: aquarium.startDate ? aquarium.startDate.toISOString() : null,
    createdAt: aquarium.createdAt.toISOString(),
    updatedAt: aquarium.updatedAt.toISOString(),
    images: aquarium.images.map((img) => ({
      ...img,
      uploadedAt: img.uploadedAt.toISOString(),
    })),
    inhabitants: aquarium.inhabitants.map((inh) => ({
      ...inh,
      addedAt: inh.addedAt.toISOString(),
    })),
    waterParams: aquarium.waterParams
      ? {
          ...aquarium.waterParams,
          lastUpdated: aquarium.waterParams.lastUpdated.toISOString(),
        }
      : null,
    ratings: aquarium.ratings.map((rating) => ({
      ...rating,
      createdAt: rating.createdAt.toISOString(),
    })),
    comments: aquarium.comments.map((comment) => {
      const serializeComment = (c: any): any => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        replies: c.replies?.map(serializeComment) || [],
      });
      return serializeComment(comment);
    }),
  };
}
