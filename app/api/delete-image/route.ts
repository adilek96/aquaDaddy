import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Minio from "minio";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, aquariumId, url } = body;

    if (!imageId || !aquariumId || !url) {
      return NextResponse.json(
        { success: false, error: "Недостаточно данных для удаления" },
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
    

    
    try {
      // Инициализируем MinIO клиент
      const minioClient = new Minio.Client({
        endPoint: minioEndpoint,
        port: minioPort,
        useSSL: minioUseSSL,
        accessKey: minioAccessKey,
        secretKey: minioSecretKey,
      });

             // Извлекаем имя файла из presigned URL
       // presigned URL содержит параметры, нужно извлечь имя файла из базы данных
       const imageRecord = await prisma.aquariumImage.findUnique({
         where: { id: imageId },
       });
       
       if (!imageRecord) {
         return NextResponse.json(
           { success: false, error: "Изображение не найдено в базе данных" },
           { status: 404 }
         );
       }
       
       // Извлекаем имя файла из URL в базе данных
       const urlParts = imageRecord.url.split('/');
       const fileName = urlParts.slice(-2).join('/'); // aquariumId/filename
      
      
      
      // Удаляем файл из MinIO
      await minioClient.removeObject(minioBucketName, fileName);
      
      
    } catch (minioError) {

      return NextResponse.json(
        { success: false, error: "Ошибка удаления из MinIO: " + (minioError instanceof Error ? minioError.message : "Неизвестная ошибка") },
        { status: 500 }
      );
    }

    // Удаляем запись из базы данных
    try {
      await prisma.aquariumImage.delete({
        where: { id: imageId },
      });

      return NextResponse.json({
        success: true,
        message: "Изображение успешно удалено",
      });
    } catch (dbError) {

      return NextResponse.json(
        { success: false, error: "Ошибка удаления из базы данных" },
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