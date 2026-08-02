import * as Minio from "minio";

/** Максимум, который допускает подписанная ссылка S3/MinIO. */
export const PRESIGNED_TTL_SECONDS = 7 * 24 * 60 * 60;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} не задан. Раньше здесь стояло значение по умолчанию — ` +
        "при пустом окружении хранилище открывалось с учётными данными из репозитория."
    );
  }
  return value;
}

export function getMinioBucket(): string {
  return process.env.MINIO_BUCKET_NAME || "aquarium-images";
}

let client: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (client) return client;

  client = new Minio.Client({
    endPoint: requireEnv("MINIO_ENDPOINT"),
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: requireEnv("MINIO_ACCESS_KEY"),
    secretKey: requireEnv("MINIO_SECRET_KEY"),
    // Без явного региона клиент перед каждой подписью ходит в хранилище
    // за локацией бакета — лишний сетевой запрос на каждую картинку
    region: process.env.MINIO_REGION || "us-east-1",
  });

  return client;
}

/**
 * Достаёт ключ объекта из сохранённой ссылки.
 * В базе лежит подписанный URL вида http://host/bucket/aquariumId/file.jpg?X-Amz-...
 */
export function objectKeyFromUrl(storedUrl: string): string | null {
  try {
    const { pathname } = new URL(storedUrl);
    const parts = pathname.split("/").filter(Boolean);
    // Первый сегмент — имя бакета, остальное — ключ объекта
    return parts.length >= 2 ? parts.slice(1).join("/") : null;
  } catch {
    return null;
  }
}

/**
 * Выдаёт свежую подписанную ссылку на тот же объект.
 * Нужна потому, что срок жизни подписи — 7 дней, а ссылка хранится в базе
 * постоянно: без обновления все картинки перестают открываться через неделю.
 */
export async function refreshImageUrl(storedUrl: string): Promise<string> {
  const key = objectKeyFromUrl(storedUrl);
  if (!key) return storedUrl;

  return getMinioClient().presignedGetObject(
    getMinioBucket(),
    key,
    PRESIGNED_TTL_SECONDS
  );
}

type WithUrl = { url: string };

/**
 * Переподписывает ссылки в списке изображений.
 * Если хранилище недоступно, возвращаем что есть — картинка не откроется,
 * но остальные данные аквариума отдать всё равно нужно.
 */
export async function refreshImageUrls<T extends WithUrl>(
  images: T[]
): Promise<T[]> {
  return Promise.all(
    images.map(async (image) => {
      try {
        return { ...image, url: await refreshImageUrl(image.url) };
      } catch {
        return image;
      }
    })
  );
}

/** Переподписывает ссылки у каждого аквариума в списке. */
export async function refreshAquariumImages<
  T extends { images?: WithUrl[] | null }
>(aquariums: T[]): Promise<T[]> {
  return Promise.all(
    aquariums.map(async (aquarium) =>
      aquarium.images && aquarium.images.length > 0
        ? { ...aquarium, images: await refreshImageUrls(aquarium.images) }
        : aquarium
    )
  );
}
