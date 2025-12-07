"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addComment(aquariumId: string, text: string, parentId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Проверяем длину комментария
    if (!text || text.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (text.length > 1000) {
      return { success: false, error: "Comment is too long (max 1000 characters)" };
    }

    // Проверяем, что аквариум публичный
    const aquarium = await prisma.aquarium.findUnique({
      where: { id: aquariumId },
      select: { isPublic: true },
    });

    if (!aquarium) {
      return { success: false, error: "Aquarium not found" };
    }

    if (!aquarium.isPublic) {
      return { success: false, error: "Aquarium is not public" };
    }

    // Если это ответ, проверяем что родительский комментарий существует
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return { success: false, error: "Parent comment not found" };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        aquariumId,
        text: text.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Не используем revalidatePath для избежания перезагрузки страницы
    // revalidatePath("/discovery");
    // revalidatePath(`/discovery/${aquariumId}`);

    return {
      success: true,
      data: {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Проверяем, что комментарий принадлежит пользователю
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, aquariumId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this comment" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Не используем revalidatePath для избежания перезагрузки страницы
    // revalidatePath("/discovery");
    // revalidatePath(`/discovery/${comment.aquariumId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function updateComment(commentId: string, text: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (!text || text.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (text.length > 1000) {
      return { success: false, error: "Comment is too long (max 1000 characters)" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, aquariumId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      return { success: false, error: "Not authorized to edit this comment" };
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { text: text.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Не используем revalidatePath для избежания перезагрузки страницы
    // revalidatePath("/discovery");
    // revalidatePath(`/discovery/${comment.aquariumId}`);

    return {
      success: true,
      data: {
        ...updatedComment,
        createdAt: updatedComment.createdAt.toISOString(),
        updatedAt: updatedComment.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, error: "Failed to update comment" };
  }
}
