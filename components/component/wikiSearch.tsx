"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Fish, Loader2, Search, X } from "lucide-react";
import WikiImage from "@/components/component/wikiImage";
import type { WikiSearchHit, WikiSearchResults } from "@/lib/wiki";
import { cn } from "@/lib/utils";

/**
 * Живой поиск по энциклопедии: по мере ввода (с задержкой) ходит в
 * /api/search и показывает статьи и обитателей в выпадающем списке.
 * Бэкенд (Meilisearch) уже отобрал язык и переподписал картинки.
 */

type Flat = WikiSearchHit & { kind: "article" | "inhabitant" };

const DEBOUNCE_MS = 220;
const MIN_CHARS = 2;

export default function WikiSearch() {
  const t = useTranslations("Wiki");
  const locale = useLocale();
  const router = useRouter();

  const [value, setValue] = useState("");
  const [results, setResults] = useState<WikiSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const query = value.trim();

  // Плоский список для навигации стрелками: сначала статьи, потом обитатели
  const flat = useMemo<Flat[]>(() => {
    if (!results) return [];
    return [
      ...results.articles.map((h) => ({ ...h, kind: "article" as const })),
      ...results.inhabitants.map((h) => ({ ...h, kind: "inhabitant" as const })),
    ];
  }, [results]);

  const hasResults = flat.length > 0;

  // Запрос с дебаунсом; предыдущий отменяем
  useEffect(() => {
    if (query.length < MIN_CHARS) {
      setResults(null);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    const id = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&locale=${encodeURIComponent(locale)}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as WikiSearchResults;
        setResults(data);
        setActive(-1);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setResults({ articles: [], inhabitants: [] });
        }
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [query, locale]);

  // Клик вне компонента закрывает выпадашку
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function hrefOf(item: Flat): string {
    return item.kind === "article" ? `/wiki/${item.id}` : `/wiki/inhabitants/${item.id}`;
  }

  function go(item: Flat) {
    setOpen(false);
    setValue("");
    setResults(null);
    router.push(hrefOf(item));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!hasResults) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(flat[active]);
    }
  }

  const subtypeLabel = (subtype?: string) =>
    subtype && t.has(`subtype.${subtype}` as "subtype.FISHS")
      ? t(`subtype.${subtype}` as "subtype.FISHS")
      : subtype ?? "";

  const showPanel =
    open && query.length >= MIN_CHARS && (loading || results !== null);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="wiki-search-results"
          value={value}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-full border border-surface-border bg-surface pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        {loading ? (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : value ? (
          <button
            type="button"
            aria-label={t("searchClear")}
            onClick={() => {
              setValue("");
              setResults(null);
            }}
            className="tap-fast absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showPanel && (
        <div
          id="wiki-search-results"
          role="listbox"
          className="absolute z-dropdown mt-2 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-surface-border bg-surface p-2 shadow-lg"
        >
          {!hasResults && !loading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("searchNothing", { query })}
            </p>
          ) : (
            <>
              {results && results.articles.length > 0 && (
                <Group
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label={t("tabArticles")}
                >
                  {results.articles.map((hit) => {
                    const item: Flat = { ...hit, kind: "article" };
                    const index = flat.indexOf(
                      flat.find((f) => f.kind === "article" && f.id === hit.id)!
                    );
                    return (
                      <Row
                        key={`a-${hit.id}`}
                        href={hrefOf(item)}
                        image={hit.image ?? null}
                        title={hit.title || t("untitled")}
                        subtitle={hit.snippet}
                        active={active === index}
                        onHover={() => setActive(index)}
                        onSelect={() => go(item)}
                      />
                    );
                  })}
                </Group>
              )}

              {results && results.inhabitants.length > 0 && (
                <Group
                  icon={<Fish className="h-3.5 w-3.5" />}
                  label={t("tabInhabitants")}
                >
                  {results.inhabitants.map((hit) => {
                    const item: Flat = { ...hit, kind: "inhabitant" };
                    const index = flat.indexOf(
                      flat.find((f) => f.kind === "inhabitant" && f.id === hit.id)!
                    );
                    return (
                      <Row
                        key={`i-${hit.id}`}
                        href={hrefOf(item)}
                        image={hit.image ?? null}
                        title={hit.title || t("untitled")}
                        subtitle={hit.snippet || subtypeLabel(hit.subtype)}
                        active={active === index}
                        onHover={() => setActive(index)}
                        onSelect={() => go(item)}
                      />
                    );
                  })}
                </Group>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Group({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <ul>{children}</ul>
    </div>
  );
}

function Row({
  href,
  image,
  title,
  subtitle,
  active,
  onHover,
  onSelect,
}: {
  href: string;
  image: string | null;
  title: string;
  subtitle?: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <a
        href={href}
        onMouseEnter={onHover}
        onClick={(e) => {
          e.preventDefault();
          onSelect();
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
          active ? "bg-accent/10" : "hover:bg-accent/10"
        )}
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
          <WikiImage src={image} alt="" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </a>
    </li>
  );
}
