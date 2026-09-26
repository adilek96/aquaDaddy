"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Globe2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { sortedCountries } from "@/lib/countries";
import { updateCountry } from "@/app/actions/countryAction";

/**
 * Предложение указать страну — показывается, только если она не выбрана.
 *
 * Это подсказка, а не требование: окно не перекрывает страницу и закрывается
 * крестиком. Отказ запоминается в localStorage на две недели, чтобы карточка
 * не встречала пользователя при каждом заходе.
 */

const SNOOZE_KEY = "aq:country-prompt-snoozed-until";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

function snoozedNow(): boolean {
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    // Приватный режим или заблокированное хранилище — просто показываем карточку
    return false;
  }
}

export default function CountryPrompt() {
  const { data: session, status, update } = useSession();
  const locale = useLocale();
  const t = useTranslations("CountryPrompt");
  const { showToast } = useToast();

  const [dismissed, setDismissed] = useState(true);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const country = (session?.user as { country?: string } | undefined)?.country;

  // Проверку хранилища делаем после монтирования: на сервере localStorage нет,
  // а расхождение разметки дало бы ошибку гидратации
  useEffect(() => {
    setDismissed(snoozedNow());
  }, []);

  const countries = useMemo(() => sortedCountries(locale), [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLocaleLowerCase(locale).includes(q) ||
        c.code.toLowerCase().startsWith(q)
    );
  }, [countries, query, locale]);

  // Список длинный: при новом запросе возвращаем прокрутку к началу,
  // иначе совпадения оказываются выше видимой области
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [query]);

  if (status !== "authenticated" || country || dismissed) return null;

  const snooze = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      /* молча: без хранилища карточка просто вернётся в следующий раз */
    }
    setDismissed(true);
  };

  const choose = async (code: string) => {
    if (saving) return;
    setSaving(code);

    const result = await updateCountry(code);

    if (!result.success) {
      setSaving(null);
      showToast(t("error"), "error");
      return;
    }

    // Обновляем токен сессии, иначе флаг появится только после перелогина
    await update({ country: result.country });
    showToast(t("saved"), "success");
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="animate-fade-in-up fixed inset-x-3 bottom-3 z-overlay sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[22rem]"
    >
      <div className="surface-panel-raised overflow-hidden p-4 shadow-lg">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Globe2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight">{t("title")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={snooze}
            aria-label={t("later")}
            className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <div
          ref={listRef}
          className="max-h-56 overflow-y-auto overscroll-contain rounded-lg border border-border"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("nothingFound")}
            </p>
          ) : (
            <ul>
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => choose(c.code)}
                    disabled={saving !== null}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-fast hover:bg-muted disabled:opacity-60"
                  >
                    <Image
                      src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                      alt=""
                      width={20}
                      height={15}
                      loading="lazy"
                      unoptimized
                      className="h-[15px] w-5 shrink-0 rounded-sm object-cover"
                    />
                    <span className="truncate">{c.name}</span>
                    {saving === c.code && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        …
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={snooze}
          className="mt-2 w-full text-muted-foreground"
        >
          {t("later")}
        </Button>
      </div>
    </div>
  );
}
