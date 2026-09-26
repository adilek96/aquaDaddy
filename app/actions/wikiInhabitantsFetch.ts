"use server";

import { AQUARIUM_TYPES, getInhabitants, type AquariumType } from "@/lib/wiki";
import { cacheGet, cacheSet, cacheVersion } from "@/lib/redis";

/**
 * Список обитателей энциклопедии для выбора в аквариум.
 *
 * Клиенту незачем видеть весь паспорт вида — только название, картинку и id,
 * поэтому ответ обрезается здесь, а не в браузере. Список меняется редко,
 * так что лежит в кэше; подписи ссылок на картинки стабильны в течение
 * суток, и закэшированные адреса не протухают за время жизни записи.
 */

export type InhabitantOption = {
  id: string;
  title: string;
  imageUrl: string;
};

const NS = "wiki-options";
const TTL_SECONDS = 300;

function asAquariumType(value?: string): AquariumType | undefined {
  return (AQUARIUM_TYPES as readonly string[]).includes(value ?? "")
    ? (value as AquariumType)
    : undefined;
}

export async function fetchInhabitantOptions(
  locale: string,
  aquariumType?: string
): Promise<InhabitantOption[]> {
  const type = asAquariumType(aquariumType);
  const key = `${NS}:v${await cacheVersion(NS)}:${locale}:${type ?? "all"}`;

  const cached = await cacheGet<InhabitantOption[]>(key);
  if (cached) return cached;

  try {
    // Подвиды тоже нужны: в аквариум сажают конкретную породу
    const list = await getInhabitants(locale, type, { includeVarieties: true });

    const options = list
      .map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, locale));

    await cacheSet(key, options, TTL_SECONDS);
    return options;
  } catch (error) {
    // Энциклопедия недоступна — окно должно остаться рабочим,
    // названия можно ввести руками
    console.error("Не удалось получить список обитателей вики:", error);
    return [];
  }
}
