import Redis from "ioredis";

/**
 * Подключение к Redis для кэша.
 *
 * Главное свойство — кэш не должен ронять приложение. Если Redis недоступен,
 * все операции тихо возвращают null, и вызывающий код идёт в базу как обычно.
 * Кэш, из-за которого падает сайт, хуже отсутствия кэша.
 */

let client: Redis | null = null;
let disabled = false;

export function getRedis(): Redis | null {
  if (disabled) return null;
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    // Без переменной просто работаем без кэша — например, в локальной разработке
    disabled = true;
    return null;
  }

  client = new Redis(url, {
    // Не копим запросы в очереди, пока соединения нет: лучше сразу промах кэша,
    // чем висящий запрос пользователя
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
    // Переподключаемся с нарастающей паузой, но не чаще чем раз в 10 секунд
    retryStrategy: (times) => Math.min(times * 200, 10_000),
  });

  client.on("error", (error) => {
    // ioredis шлёт error на каждую неудачную попытку переподключения.
    // Логируем коротко, чтобы не забивать вывод стектрейсами.
    console.warn("[redis] недоступен:", error.message);
  });

  return client;
}

/** Достаёт значение и разбирает JSON. Любая ошибка — просто промах кэша. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Кладёт значение с временем жизни. Ошибку глотаем: запись в кэш не критична. */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    /* молча: кэш не обязателен */
  }
}

/**
 * Версия пространства имён кэша.
 *
 * Сбрасывать кэш перебором ключей (KEYS/SCAN) дорого и на больших базах
 * блокирует Redis. Вместо этого номер версии входит в каждый ключ: достаточно
 * увеличить счётчик, и все старые ключи становятся недостижимы, а потом
 * отмирают сами по TTL.
 */
export async function cacheVersion(namespace: string): Promise<string> {
  const redis = getRedis();
  if (!redis) return "0";
  try {
    const value = await redis.get(`ver:${namespace}`);
    return value ?? "0";
  } catch {
    return "0";
  }
}

/** Делает недействительным весь кэш пространства имён. */
export async function bumpCacheVersion(namespace: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.incr(`ver:${namespace}`);
  } catch {
    /* молча */
  }
}
