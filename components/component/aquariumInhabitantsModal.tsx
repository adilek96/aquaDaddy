"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Fish,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { useModalDismiss } from "@/lib/useModalDismiss";
import {
  fetchInhabitantOptions,
  type InhabitantOption,
} from "@/app/actions/wikiInhabitantsFetch";
import {
  useInhabitantGroups,
  useSubtypeLabel,
  type StoredInhabitant,
} from "./inhabitantList";

/**
 * Редактирование обитателей аквариума.
 *
 * Добавление идёт в два шага: сначала категория, потом вид из её списка.
 * Список разбит по восемь записей на страницу и фильтруется поиском — в
 * энциклопедии уже под сотню видов, и одним свитком это не листается.
 *
 * У записи сохраняется id вида, поэтому название, фотография и категория
 * потом берутся из энциклопедии на языке интерфейса. Ввод своего названия
 * оставлен: в банке может жить то, чего в вики пока нет.
 */

const PAGE_SIZE = 8;

type Row = StoredInhabitant & { key: string };

let rowCounter = 0;
const nextKey = () => `row-${++rowCounter}`;

function rowsFromAquarium(inhabitants: unknown): Row[] {
  if (!Array.isArray(inhabitants)) return [];
  return inhabitants
    .map((item: { species?: unknown; count?: unknown; wikiId?: unknown }) => ({
      key: nextKey(),
      species: String(item?.species ?? "").trim(),
      count: Number(item?.count) > 0 ? Math.trunc(Number(item.count)) : 1,
      wikiId: typeof item?.wikiId === "string" ? item.wikiId : null,
    }))
    .filter((row) => row.species.length > 0);
}

export default function AquariumInhabitantsModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const locale = useLocale();
  const subtypeLabel = useSubtypeLabel();

  const [rows, setRows] = useState<Row[]>([]);
  const [options, setOptions] = useState<InhabitantOption[] | null>(null);
  const [subtype, setSubtype] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isInhabitantsModalOpen,
    selectedAquarium,
    onSaveInhabitants,
    closeInhabitantsModal,
  } = useAquariumEditStore();

  useEffect(() => {
    if (!isInhabitantsModalOpen || !selectedAquarium) return;
    setRows(rowsFromAquarium(selectedAquarium.inhabitants));
    setSubtype(null);
    setQuery("");
    setPage(0);
  }, [isInhabitantsModalOpen, selectedAquarium]);

  // Список энциклопедии грузим один раз на открытие: он небольшой и лежит в
  // кэше, а запрос на каждую букву отзывался бы задержкой
  useEffect(() => {
    if (!isInhabitantsModalOpen) return;
    let cancelled = false;
    fetchInhabitantOptions(locale, selectedAquarium?.type).then((list) => {
      if (!cancelled) setOptions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [isInhabitantsModalOpen, locale, selectedAquarium?.type]);

  // Категории — только те, в которых для этого аквариума есть виды
  const categories = useMemo(() => {
    if (!options) return [];
    const counts = new Map<string, number>();
    for (const option of options) {
      counts.set(option.subtype, (counts.get(option.subtype) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([code, count]) => ({ code, count, label: subtypeLabel(code) }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
    // subtypeLabel пересоздаётся на каждый рендер
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, locale]);

  const trimmedQuery = query.trim();

  const filtered = useMemo(() => {
    if (!options || !subtype) return [];
    const q = trimmedQuery.toLocaleLowerCase(locale);
    return options.filter(
      (option) =>
        option.subtype === subtype &&
        (!q || option.title.toLocaleLowerCase(locale).includes(q))
    );
  }, [options, subtype, trimmedQuery, locale]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Страница могла остаться за концом списка после фильтрации
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const added = useMemo(
    () => new Set(rows.map((r) => r.wikiId).filter(Boolean) as string[]),
    [rows]
  );

  const canAddCustom =
    trimmedQuery.length > 0 &&
    !filtered.some(
      (option) =>
        option.title.toLocaleLowerCase(locale) ===
        trimmedQuery.toLocaleLowerCase(locale)
    );

  const groups = useInhabitantGroups(rows);

  const addOption = (option: InhabitantOption) =>
    setRows((prev) => {
      const index = prev.findIndex((r) => r.wikiId === option.id);
      // Повторное нажатие на тот же вид — не дубль, а «стало больше»
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], count: next[index].count + 1 };
        return next;
      }
      return [
        ...prev,
        {
          key: nextKey(),
          species: option.title,
          count: 1,
          wikiId: option.id,
        },
      ];
    });

  const addCustom = () => {
    const name = trimmedQuery;
    if (!name) return;
    setRows((prev) => {
      const index = prev.findIndex(
        (r) =>
          !r.wikiId &&
          r.species.toLocaleLowerCase(locale) === name.toLocaleLowerCase(locale)
      );
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], count: next[index].count + 1 };
        return next;
      }
      return [...prev, { key: nextKey(), species: name, count: 1, wikiId: null }];
    });
    setQuery("");
  };

  const setCount = (key: string, count: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, count: Math.max(1, Math.trunc(count) || 1) } : r
      )
    );

  const removeRow = (key: string) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const handleClose = () => closeInhabitantsModal();

  const handleSave = async () => {
    if (!onSaveInhabitants) return;

    const list = rows.map(({ species, count, wikiId }) => ({
      species,
      count,
      wikiId: wikiId ?? null,
    }));

    setIsLoading(true);
    try {
      await onSaveInhabitants({
        // Строку по-прежнему передаём: её ждут старые обработчики
        inhabitants: list.map((r) => `${r.species} (${r.count})`).join(", "),
        inhabitantsList: list,
      });
      closeInhabitantsModal();
    } finally {
      setIsLoading(false);
    }
  };

  // Escape закрывает окно, фон под ним не прокручивается
  useModalDismiss(isInhabitantsModalOpen, handleClose);

  if (!isInhabitantsModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center overflow-y-auto overscroll-contain bg-scrim/60 p-4 backdrop-blur-sm sm:items-center">
      <Card className="surface-panel-raised my-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editInhabitants")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Шаг 1 — категория */}
          {subtype === null ? (
            <div>
              <Label>{t("chooseCategory")}</Label>
              {options === null ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  {t("wikiUnavailable")}
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.code}
                      type="button"
                      onClick={() => {
                        setSubtype(category.code);
                        setQuery("");
                        setPage(0);
                      }}
                      className="surface-interactive flex flex-col items-start rounded-lg border border-border px-3 py-2.5 text-left transition-colors duration-fast hover:border-primary/40"
                    >
                      <span className="text-sm font-medium">
                        {category.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("speciesCount", { count: category.count })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Шаг 2 — вид из категории */
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSubtype(null);
                    setQuery("");
                    setPage(0);
                  }}
                  className="-ml-2 gap-1 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("allCategories")}
                </Button>
                <span className="truncate text-sm font-medium">
                  {subtypeLabel(subtype)}
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder={t("searchInhabitantPlaceholder")}
                  aria-label={t("searchInhabitantPlaceholder")}
                  className="pl-9"
                  autoComplete="off"
                />
              </div>

              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                {pageItems.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {t("noInhabitantsFound")}
                  </p>
                ) : (
                  <ul>
                    {pageItems.map((option) => (
                      <li
                        key={option.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => addOption(option)}
                          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm transition-colors duration-fast hover:bg-muted"
                        >
                          {option.imageUrl ? (
                            <Image
                              src={option.imageUrl}
                              alt=""
                              width={36}
                              height={36}
                              sizes="36px"
                              className="h-9 w-9 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Fish className="h-4 w-4" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {option.title}
                          </span>
                          {added.has(option.id) ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {t("alreadyAdded")}
                            </span>
                          ) : null}
                          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Пагинация — по восемь записей на страницу */}
              {filtered.length > PAGE_SIZE && (
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 px-2"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                    aria-label={t("previousPage")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t("pageOf", { page: safePage + 1, total: pageCount })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 px-2"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage(safePage + 1)}
                    aria-label={t("nextPage")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {canAddCustom && (
                <button
                  type="button"
                  onClick={addCustom}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-fast hover:border-primary/40 hover:text-foreground"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {t("addCustomInhabitant", { name: trimmedQuery })}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Уже добавленные — списком, с фотографиями, по категориям */}
          <div>
            <Label>{t("addedInhabitants")}</Label>
            {groups.length === 0 ? (
              <p className="mt-1 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                {t("noInhabitantsYet")}
              </p>
            ) : (
              <div className="mt-1 max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1">
                {groups.map((group) => (
                  <div key={group.subtype}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                    <ul className="space-y-1.5">
                      {group.items.map((row) => {
                        return (
                          <li
                            key={row.key}
                            className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5"
                          >
                            {row.imageUrl ? (
                              <Image
                                src={row.imageUrl}
                                alt=""
                                width={32}
                                height={32}
                                sizes="32px"
                                className="h-8 w-8 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Fish className="h-4 w-4" />
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate text-sm">
                              {row.title}
                            </span>

                            <div className="flex shrink-0 items-center gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={t("decreaseCount")}
                                disabled={row.count <= 1}
                                onClick={() => setCount(row.key, row.count - 1)}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={row.count}
                                onChange={(e) =>
                                  setCount(row.key, Number(e.target.value))
                                }
                                aria-label={t("count")}
                                className="h-7 w-12 px-1 text-center text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={t("increaseCount")}
                                onClick={() => setCount(row.key, row.count + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                aria-label={t("removeInhabitant")}
                                onClick={() => removeRow(row.key)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {t("saving")}
                </div>
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
