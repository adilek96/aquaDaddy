"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Fish } from "lucide-react";
import {
  fetchInhabitantOptions,
  type InhabitantOption,
} from "@/app/actions/wikiInhabitantsFetch";

/**
 * Обитатели аквариума — списком, с фотографиями и по категориям.
 *
 * В базе у записи лежит только название, количество и id вида в энциклопедии.
 * Фотография, категория и название на языке интерфейса берутся из вики по
 * этому id: иначе при смене языка список остался бы на том, на котором его
 * заполняли. У записей, введённых вручную, id нет — для них показывается
 * сохранённое название, а категория одна, «Прочее».
 */

export type StoredInhabitant = {
  id?: string;
  species: string;
  count: number;
  wikiId?: string | null;
};

/** Порядок категорий: сначала рыбы, в конце — всё остальное. */
const SUBTYPE_ORDER = [
  "FISHS",
  "SHRIMPS",
  "CRAYFISH",
  "CRABS",
  "SNAILS",
  "STARFISHS",
  "CORALS",
  "TURTLES",
  "FROGS",
  "AMPHIBIANS",
  "REPTILES",
  "PLANTS",
];

const OTHER = "OTHER";

function subtypeRank(subtype: string): number {
  const index = SUBTYPE_ORDER.indexOf(subtype);
  return index === -1 ? SUBTYPE_ORDER.length + 1 : index;
}

/**
 * Справочник энциклопедии по id вида.
 * Список небольшой и лежит в кэше, поэтому запрашивается целиком.
 */
export function useWikiIndex(): Map<string, InhabitantOption> | null {
  const locale = useLocale();
  const [options, setOptions] = useState<InhabitantOption[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInhabitantOptions(locale).then((list) => {
      if (!cancelled) setOptions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return useMemo(
    () => (options ? new Map(options.map((o) => [o.id, o])) : null),
    [options]
  );
}

/** Название категории на языке интерфейса; для незнакомого кода — «Прочее». */
export function useSubtypeLabel() {
  const tWiki = useTranslations("Wiki");
  const tForm = useTranslations("AquariumForm");

  return (subtype: string) => {
    const key = `subtype.${subtype}` as "subtype.FISHS";
    return tWiki.has(key) ? tWiki(key) : tForm("otherInhabitants");
  };
}

export type InhabitantGroup<T extends StoredInhabitant = StoredInhabitant> = {
  subtype: string;
  label: string;
  items: Array<T & { title: string; imageUrl?: string }>;
};

/**
 * Раскладывает записи по категориям и подставляет данные из энциклопедии.
 * Тип записи сохраняется: окну редактирования нужны его собственные поля.
 */
export function useInhabitantGroups<T extends StoredInhabitant>(
  inhabitants: T[] | undefined
): Array<InhabitantGroup<T>> {
  const index = useWikiIndex();
  const subtypeLabel = useSubtypeLabel();
  const locale = useLocale();

  return useMemo(() => {
    const groups = new Map<string, InhabitantGroup<T>>();

    for (const item of inhabitants ?? []) {
      const wiki = item.wikiId ? index?.get(item.wikiId) : undefined;
      const subtype = wiki?.subtype ?? OTHER;

      if (!groups.has(subtype)) {
        groups.set(subtype, {
          subtype,
          label: subtypeLabel(subtype),
          items: [],
        });
      }

      groups.get(subtype)!.items.push({
        ...item,
        title: wiki?.title ?? item.species,
        imageUrl: wiki?.imageUrl,
      });
    }

    const list = [...groups.values()];
    list.sort((a, b) => subtypeRank(a.subtype) - subtypeRank(b.subtype));
    for (const group of list) {
      group.items.sort((a, b) => a.title.localeCompare(b.title, locale));
    }
    return list;
    // subtypeLabel пересоздаётся на каждый рендер, поэтому в зависимости не идёт
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inhabitants, index, locale]);
}

export function InhabitantList({
  inhabitants,
  emptyText,
}: {
  inhabitants: StoredInhabitant[] | undefined;
  emptyText: string;
}) {
  const groups = useInhabitantGroups(inhabitants);

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.subtype}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-1.5">
            {group.items.map((item) => (
              <li
                key={item.id ?? `${group.subtype}-${item.title}`}
                className="flex items-center gap-3 rounded-lg border border-border px-2.5 py-2"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Fish className="h-5 w-5" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  ×{item.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
