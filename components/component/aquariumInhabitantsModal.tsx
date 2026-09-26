"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fish, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { useModalDismiss } from "@/lib/useModalDismiss";
import {
  fetchInhabitantOptions,
  type InhabitantOption,
} from "@/app/actions/wikiInhabitantsFetch";

/**
 * Редактирование обитателей аквариума.
 *
 * Раньше здесь было одно поле, куда список набивался руками в формате
 * «Вид (2), Вид (1)»: названия писались вразнобой, а запятая внутри названия
 * разбивала запись надвое. Теперь обитатели — это строки списка, а виды
 * подставляются из энциклопедии, чтобы названия совпадали с её статьями.
 * Ввод своего названия остался: в банке может жить то, чего в вики пока нет.
 */

type Row = { key: string; species: string; count: number; imageUrl?: string };

let rowCounter = 0;
const nextKey = () => `row-${++rowCounter}`;

/** Разбор старого строкового формата — на случай, если в аквариуме он ещё остался. */
function rowsFromAquarium(inhabitants: unknown): Row[] {
  if (!Array.isArray(inhabitants)) return [];
  return inhabitants
    .map((item: { species?: unknown; count?: unknown }) => ({
      key: nextKey(),
      species: String(item?.species ?? "").trim(),
      count: Number(item?.count) > 0 ? Math.trunc(Number(item.count)) : 1,
    }))
    .filter((row) => row.species.length > 0);
}

export default function AquariumInhabitantsModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const locale = useLocale();

  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<InhabitantOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const {
    isInhabitantsModalOpen,
    selectedAquarium,
    onSaveInhabitants,
    closeInhabitantsModal,
  } = useAquariumEditStore();

  useEffect(() => {
    if (!isInhabitantsModalOpen || !selectedAquarium) return;
    setRows(rowsFromAquarium(selectedAquarium.inhabitants));
    setQuery("");
  }, [isInhabitantsModalOpen, selectedAquarium]);

  // Список энциклопедии грузим один раз на открытие и фильтруем уже на месте:
  // он небольшой, а запрос на каждую букву отзывался бы задержкой
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

  const trimmedQuery = query.trim();

  const matches = useMemo(() => {
    if (!options || !trimmedQuery) return [];
    const q = trimmedQuery.toLocaleLowerCase(locale);
    const taken = new Set(rows.map((r) => r.species.toLocaleLowerCase(locale)));
    return options
      .filter(
        (o) =>
          o.title.toLocaleLowerCase(locale).includes(q) &&
          !taken.has(o.title.toLocaleLowerCase(locale))
      )
      .slice(0, 8);
  }, [options, trimmedQuery, locale, rows]);

  // Своё название предлагаем, только если в энциклопедии точного совпадения нет
  const canAddCustom =
    trimmedQuery.length > 0 &&
    !rows.some(
      (r) =>
        r.species.toLocaleLowerCase(locale) ===
        trimmedQuery.toLocaleLowerCase(locale)
    ) &&
    !(options ?? []).some(
      (o) =>
        o.title.toLocaleLowerCase(locale) ===
        trimmedQuery.toLocaleLowerCase(locale)
    );

  const addRow = (species: string, imageUrl?: string) => {
    const name = species.trim();
    if (!name) return;

    setRows((prev) => {
      const index = prev.findIndex(
        (r) =>
          r.species.toLocaleLowerCase(locale) === name.toLocaleLowerCase(locale)
      );
      // Повторное добавление того же вида — не дубль, а «стало больше»
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], count: next[index].count + 1 };
        return next;
      }
      return [...prev, { key: nextKey(), species: name, count: 1, imageUrl }];
    });

    setQuery("");
    searchRef.current?.focus();
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

    const list = rows.map(({ species, count }) => ({ species, count }));

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
      <Card className="surface-panel-raised my-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editInhabitants")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="inhabitant-search">{t("addFromWiki")}</Label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="inhabitant-search"
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (matches.length > 0) {
                    addRow(matches[0].title, matches[0].imageUrl);
                  } else if (canAddCustom) {
                    addRow(trimmedQuery);
                  }
                }}
                placeholder={t("searchInhabitantPlaceholder")}
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {trimmedQuery.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                {options === null ? (
                  <div className="space-y-2 p-3">
                    <div className="skeleton h-8 w-full" />
                    <div className="skeleton h-8 w-2/3" />
                  </div>
                ) : (
                  <>
                    <ul>
                      {matches.map((option) => (
                        <li key={option.id}>
                          <button
                            type="button"
                            onClick={() => addRow(option.title, option.imageUrl)}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-fast hover:bg-muted"
                          >
                            {option.imageUrl ? (
                              <Image
                                src={option.imageUrl}
                                alt=""
                                width={28}
                                height={28}
                                className="h-7 w-7 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Fish className="h-4 w-4" />
                              </span>
                            )}
                            <span className="truncate">{option.title}</span>
                            <Plus className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {canAddCustom && (
                      <button
                        type="button"
                        onClick={() => addRow(trimmedQuery)}
                        className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {t("addCustomInhabitant", { name: trimmedQuery })}
                        </span>
                      </button>
                    )}

                    {matches.length === 0 && !canAddCustom && (
                      <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                        {t("noInhabitantsFound")}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>{t("inhabitants")}</Label>
            {rows.length === 0 ? (
              <p className="mt-1 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                {t("noInhabitantsYet")}
              </p>
            ) : (
              <ul className="mt-1 max-h-64 space-y-1.5 overflow-y-auto overscroll-contain">
                {rows.map((row) => (
                  <li
                    key={row.key}
                    className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {row.species}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
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
                        onChange={(e) => setCount(row.key, Number(e.target.value))}
                        aria-label={t("count")}
                        className="h-7 w-14 px-1 text-center text-sm"
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
                ))}
              </ul>
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
