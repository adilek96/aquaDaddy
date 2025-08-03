import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Minio from "minio";

export async function POST(request: NextRequest) {
  try {
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

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Поддерживаются только изображения" },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Размер файла не должен превышать 10MB" },
        { status: 400 }
      );
    }

    // Настройки MinIO из переменных окружения
    const minioEndpoint = process.env.MINIO_ENDPOINT || '194.163.151.11';
    const minioPort = parseInt(process.env.MINIO_PORT || '9000');
    const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    const minioBucketName = process.env.MINIO_BUCKET_NAME || 'aquarium-images';
    const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
    

    
    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${aquariumId}/${timestamp}.${fileExtension}`;

    let imageUrl: string;

    try {
      // Инициализируем MinIO клиент
      const minioClient = new Minio.Client({
        endPoint: minioEndpoint,
        port: minioPort,
        useSSL: minioUseSSL,
        accessKey: minioAccessKey,
        secretKey: minioSecretKey,
      });

      // Проверяем существование бакета
      const bucketExists = await minioClient.bucketExists(minioBucketName);
      if (!bucketExists) {
        console.log("Создаем бакет:", minioBucketName);
        await minioClient.makeBucket(minioBucketName);
      }

      // Конвертируем файл в буфер
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Загружаем файл в MinIO
      await minioClient.putObject(minioBucketName, fileName, buffer, file.size, {
        'Content-Type': file.type,
      });

      // Генерируем presigned URL для доступа к файлу (действует 7 дней)
      imageUrl = await minioClient.presignedGetObject(minioBucketName, fileName, 7 * 24 * 60 * 60);
    } catch (minioError) {

      return NextResponse.json(
        { success: false, error: "Ошибка загрузки в MinIO: " + (minioError instanceof Error ? minioError.message : "Неизвестная ошибка") },
        { status: 500 }
      );
    }

    // Сохраняем ссылку в базе данных
    try {
      const savedImage = await prisma.aquariumImage.create({
        data: {
          aquariumId: aquariumId,
          url: imageUrl,
        },
      });

      return NextResponse.json({
        success: true,
        url: imageUrl,
        fileName: fileName,
        imageId: savedImage.id,
        uploadedAt: savedImage.uploadedAt.toISOString(),
      });
    } catch (dbError) {

      return NextResponse.json(
        { success: false, error: "Ошибка сохранения в базе данных" },
        { status: 500 }
      );
    }

  } catch (error) {

    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 