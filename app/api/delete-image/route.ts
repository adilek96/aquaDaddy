import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/apiAuth";
import { getMinioBucket, getMinioClient, objectKeyFromUrl } from "@/lib/minio";

export async function DELETE(request: NextRequest) {
  try {
    // Раньше роут не проверял вообще ничего: по одному id можно было
    // удалить чужое изображение и из хранилища, и из базы
    const user = await getApiUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageId } = body;

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: "Не указан imageId" },
        { status: 400 }
      );
    }

    // Владельца берём из базы, а не из тела запроса
    const imageRecord = await prisma.aquariumImage.findFirst({
      where: {
        id: imageId,
        aquarium: { userId: user.id },
      },
      select: { id: true, url: true },
    });

    if (!imageRecord) {
      return NextResponse.json(
        { success: false, error: "Изображение не найдено" },
        { status: 404 }
      );
    }

    const objectKey = objectKeyFromUrl(imageRecord.url);

    if (objectKey) {
      try {
        await getMinioClient().removeObject(getMinioBucket(), objectKey);
      } catch (minioError) {
        console.error("Ошибка удаления из MinIO:", minioError);
        return NextResponse.json(
          {
            success: false,
            error:
              "Ошибка удаления из хранилища: " +
              (minioError instanceof Error
                ? minioError.message
                : "неизвестная ошибка"),
          },
          { status: 500 }
        );
      }
    }

    await prisma.aquariumImage.delete({ where: { id: imageId } });

    return NextResponse.json({
      success: true,
      message: "Изображение успешно удалено",
    });
  } catch (error) {
    console.error("Ошибка удаления изображения:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
