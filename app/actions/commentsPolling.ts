"use server";
import { prisma } from "@/lib/prisma";

export async function fetchComments(aquariumId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { 
        aquariumId,
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
    });

    const serializeComment = (comment: any): any => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      replies: comment.replies?.map(serializeComment) || [],
    });

    return {
      success: true,
      data: comments.map(serializeComment),
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}

export async function fetchAquariumStats(aquariumId: string) {
  try {
    const [commentsCount, ratings] = await Promise.all([
      prisma.comment.count({ where: { aquariumId } }),
      prisma.rating.findMany({ where: { aquariumId } }),
    ]);

    const totalRating = ratings.reduce((sum, rating) => sum + rating.value, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    return {
      success: true,
      data: {
        commentsCount,
        ratingsCount: ratings.length,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
