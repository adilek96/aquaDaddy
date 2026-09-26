import { PrismaClient } from "@prisma/client";
import { bumpCacheVersion } from "@/lib/redis";

/**
 * Модели, изменение которых влияет на публичную ленту «Сообщество»
 * и карточки аквариумов.
 */
const CACHED_MODELS = new Set([
  "Aquarium",
  "AquariumImage",
  "Rating",
  "Comment",
  "Inhabitant",
  "WaterParameters",
  "User",
]);

const WRITE_OPERATIONS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
]);

/**
 * Сброс кэша повешен на сам клиент Prisma, а не расставлен по действиям.
 *
 * Точек записи в проекте несколько десятков в семи файлах, и при добавлении
 * новой про сброс легко забыть — лента начнёт показывать устаревшие данные,
 * а заметят это далеко не сразу. Здесь любая запись в перечисленные модели
 * повышает версию кэша автоматически.
 */
function createClient() {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args);

          if (WRITE_OPERATIONS.has(operation) && CACHED_MODELS.has(model)) {
            // Не ждём Redis: сброс кэша не должен задерживать ответ
            // пользователю и тем более ронять запись при недоступном кэше.
            void bumpCacheVersion("discovery");
          }

          return result;
        },
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrisma };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
