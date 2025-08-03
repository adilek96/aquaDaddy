"use server";

import { prisma } from "@/lib/prisma";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToMinIO(
  file: File,
  aquariumId: string
): Promise<UploadResponse> {
  try {
    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append("file", file);
    formData.append("aquariumId", aquariumId);

    // Отправляем файл на наш API endpoint
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.url) {
      throw new Error(result.error || "Неизвестная ошибка при загрузке");
    }

    // Сохраняем ссылку в базе данных
    const savedImage = await prisma.aquariumImage.create({
      data: {
        aquariumId: aquariumId,
        url: result.url,
      },
    });

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
}

export async function deleteImageFromMinIO(
  imageId: string,
  aquariumId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Получаем информацию об изображении
    const image = await prisma.aquariumImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error("Изображение не найдено");
    }

    // Отправляем запрос на удаление через наш API endpoint
    const response = await fetch("/api/delete-image", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId: imageId,
        aquariumId: aquariumId,
        url: image.url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка удаления: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Неизвестная ошибка при удалении");
    }

    // Удаляем запись из базы данных
    await prisma.aquariumImage.delete({
      where: { id: imageId },
    });

    return { success: true };
  } catch (error) {
    console.error("Ошибка удаления изображения:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
}

export async function getAquariumImages(aquariumId: string) {
  try {
    const images = await prisma.aquariumImage.findMany({
      where: { aquariumId: aquariumId },
      orderBy: { uploadedAt: "desc" },
    });

    return {
      success: true,
      images: images.map(img => ({
        ...img,
        uploadedAt: img.uploadedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Ошибка получения изображений:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
      images: [],
    };
  }
} 