import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/apiAuth";
import {
  PRESIGNED_TTL_SECONDS,
  getMinioBucket,
  getMinioClient,
} from "@/lib/minio";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Без проверки роут позволял любому заливать файлы в хранилище
    // и создавать записи в чужих аквариумах
    const user = await getApiUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const aquariumId = formData.get("aquariumId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Файл не найден" },
        { status: 400 }
      );
    }

    if (!aquariumId) {
      return NextResponse.json(
        { success: false, error: "ID аквариума не указан" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Поддерживаются только изображения" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Размер файла не должен превышать 10MB" },
        { status: 400 }
      );
    }

    const aquarium = await prisma.aquarium.findFirst({
      where: { id: aquariumId, userId: user.id },
      select: { id: true },
    });

    if (!aquarium) {
      return NextResponse.json(
        { success: false, error: "Аквариум не найден" },
        { status: 404 }
      );
    }

    const bucket = getMinioBucket();
    // Расширение берём из типа файла, а не из присланного имени
    const extension = file.type.split("/")[1]?.split("+")[0] || "bin";
    const fileName = `${aquariumId}/${Date.now()}.${extension}`;

    let imageUrl: string;

    try {
      const minioClient = getMinioClient();

      const bucketExists = await minioClient.bucketExists(bucket);
      if (!bucketExists) {
        await minioClient.makeBucket(bucket);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      await minioClient.putObject(bucket, fileName, buffer, file.size, {
        "Content-Type": file.type,
      });

      imageUrl = await minioClient.presignedGetObject(
        bucket,
        fileName,
        PRESIGNED_TTL_SECONDS
      );
    } catch (minioError) {
      console.error("Ошибка загрузки в MinIO:", minioError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Ошибка загрузки в хранилище: " +
            (minioError instanceof Error
              ? minioError.message
              : "неизвестная ошибка"),
        },
        { status: 500 }
      );
    }

    const savedImage = await prisma.aquariumImage.create({
      data: { aquariumId, url: imageUrl },
    });

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName,
      imageId: savedImage.id,
      uploadedAt: savedImage.uploadedAt.toISOString(),
    });
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
