import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, ChevronLeft, ChevronRight, CloudOff, Fish } from "lucide-react";
import { generateWikiMetadata } from "@/components/helpers/MetaTags";
import { EmptyState } from "@/components/ui/empty-state";
import WikiImage from "@/components/component/wikiImage";
import WikiSearch from "@/components/component/wikiSearch";
import FilterPanel from "@/components/component/filterPanel";
import {
  AQUARIUM_TYPES,
  articleExcerpt,
  getArticles,
  getInhabitants,
  getSubCategories,
  refreshWikiImage,
  type AquariumType,
  type WikiArticle,
  type WikiInhabitant,
  type WikiSubCategory,
} from "@/lib/wiki";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  return generateWikiMetadata(await getLocale());
}

type Tab = "articles" | "inhabitants";

// Сортировка: по алфавиту (по умолчанию) или по видам — у обитателей по
// подтипу (рыбы, растения, креветки…), у статей по разделу.
type Sort = "az" | "type";

// Фасеты обитателей: подкатегория (подтип) и поля паспорта. Значения берём
// из profile, фильтруем прямо на странице — список и так грузится целиком.
type FacetKey = "subtype" | "difficulty" | "temperament" | "light" | "co2";
const FACET_KEYS: FacetKey[] = ["subtype", "difficulty", "temperament", "light", "co2"];

type SearchParams = {
  tab?: string;
  sub?: string;
  type?: string;
  page?: string;
  sort?: string;
} & Partial<Record<FacetKey, string>>;

// Энциклопедия может разрастись до сотен карточек — показываем по 50 на страницу
const WIKI_PAGE_SIZE = 50;

type WikiHrefParams = {
  tab: Tab;
  sub?: string;
  type?: string;
  page?: number;
  sort?: Sort;
} & Partial<Record<FacetKey, string | undefined>>;

function wikiHref(params: WikiHrefParams) {
  const search = new URLSearchParams();
  if (params.tab !== "articles") search.set("tab", params.tab);
  if (params.sub) search.set("sub", params.sub);
  if (params.type) search.set("type", params.type);
  for (const key of FACET_KEYS) {
    const value = params[key];
    if (value) search.set(key, value);
  }
  // az — значение по умолчанию, в адрес его не пишем
  if (params.sort && params.sort !== "az") search.set("sort", params.sort);
  // Смена вкладки или фильтра идёт без page — список сам вернётся на первую страницу
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/wiki?${qs}` : "/wiki";
}

// Канонический порядок значений фасетов (не алфавитный — по смыслу)
const FACET_VALUES: Record<FacetKey, string[]> = {
  subtype: [
    "FISHS",
    "SHRIMPS",
    "CRAYFISH",
    "CRABS",
    "SNAILS",
    "STARFISHS",
    "CORALS",
    "PLANTS",
    "REPTILES",
    "AMPHIBIANS",
    "TURTLES",
    "FROGS",
  ],
  difficulty: ["EASY", "MEDIUM", "HARD"],
  temperament: ["PEACEFUL", "SEMI_AGGRESSIVE", "AGGRESSIVE", "PREDATOR"],
  light: ["LOW", "MEDIUM", "HIGH"],
  co2: ["NONE", "RECOMMENDED", "REQUIRED"],
};

type InhabitantItem = WikiInhabitant & { image?: string | null };

/** Значение обитателя по ключу фасета: подтип либо строковое поле паспорта. */
function facetValue(item: InhabitantItem, key: FacetKey): string | undefined {
  if (key === "subtype") return item.subtype || undefined;
  const value = item.profile?.[key];
  return typeof value === "string" ? value : undefined;
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "tap-fast inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-surface-border bg-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Энциклопедия: статьи и обитатели из aquaWikiBackend. Фильтры — в адресе
 * (?tab=, ?sub=, ?type=), поэтому страница рендерится на сервере целиком
 * и любую выборку можно отправить ссылкой.
 */
export default async function Wiki({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const tHome = await getTranslations("HomePage");
  const t = await getTranslations("Wiki");
  const tTypes = await getTranslations("Discovery");

  const tab: Tab = params.tab === "inhabitants" ? "inhabitants" : "articles";
  const type = AQUARIUM_TYPES.find((value) => value === params.type);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const sort: Sort = params.sort === "type" ? "type" : "az";

  const typeLabel = (value: AquariumType) =>
    tTypes(`aquariumType.${value.toLowerCase()}` as "aquariumType.freshwater");

  const subtypeLabel = (value: string) =>
    t.has(`subtype.${value}` as "subtype.FISHS") ? t(`subtype.${value}` as "subtype.FISHS") : value;

  // Заголовок группы фасетов
  const facetLabel = (key: FacetKey) => t(`filter.${key}` as "filter.subtype");

  // Подпись значения фасета: подтип — из Wiki.subtype, остальные — из options
  // (у освещённости набор значений общий — options.level)
  const facetValueLabel = (key: FacetKey, value: string) => {
    if (key === "subtype") return subtypeLabel(value);
    const path = key === "light" ? "options.level" : `options.${key}`;
    return t(`${path}.${value}` as "options.difficulty.EASY");
  };

  // Сравнение названий на языке интерфейса (регистр и буквы правильно)
  const byTitle = (a: string, b: string) => a.localeCompare(b, locale, { sensitivity: "base" });

  // Выбранные фасеты обитателей из адреса
  const activeFacets: Partial<Record<FacetKey, string>> = {};
  for (const key of FACET_KEYS) {
    const value = params[key];
    if (value) activeFacets[key] = value;
  }

  // Проходит ли обитатель активные фасеты (можно исключить один — для подсчёта
  // доступных значений самого фасета)
  const itemMatches = (item: InhabitantItem, except?: FacetKey) =>
    FACET_KEYS.every((key) => {
      if (key === except) return true;
      const selected = activeFacets[key];
      return !selected || facetValue(item, key) === selected;
    });

  // Ссылка-переключатель значения одного фасета (остальные сохраняются).
  // value === undefined снимает фасет («Все»).
  const facetHref = (key: FacetKey, value: string | undefined) => {
    const next: WikiHrefParams = { tab, type: params.type, sort, ...activeFacets };
    next[key] = value;
    return wikiHref(next);
  };

  // Сколько фасетов применено — для бейджа на кнопке «Фильтры»
  // (тип аквариума и сортировка вынесены наружу, их не считаем)
  const activeFacetCount = Object.keys(activeFacets).length;

  let articles: WikiArticle[] = [];
  let inhabitants: (WikiInhabitant & { image: string | null })[] = [];
  let subCategories: WikiSubCategory[] = [];
  // Группы фасетов для показа (только с непустым набором значений)
  let facetGroups: { key: FacetKey; values: string[] }[] = [];
  let totalItems = 0;
  let failed = false;

  try {
    if (tab === "articles") {
      const [allArticles, subs] = await Promise.all([
        getArticles(locale, params.sub),
        getSubCategories(locale),
      ]);
      subCategories = subs;
      // Сортируем весь список до разбивки на страницы: по разделу (по видам)
      // с запасным ключом — названием, либо просто по алфавиту
      allArticles.sort((a, b) => {
        if (sort === "type") {
          const bySection = byTitle(
            a.subCategories[0]?.title || "",
            b.subCategories[0]?.title || ""
          );
          if (bySection) return bySection;
        }
        return byTitle(a.title || "", b.title || "");
      });
      totalItems = allArticles.length;
      // Фото обновляем только для показанной страницы, а не для всех статей сразу
      articles = allArticles.slice((page - 1) * WIKI_PAGE_SIZE, page * WIKI_PAGE_SIZE);
    } else {
      const list = await getInhabitants(locale, type);

      // Доступные значения каждого фасета с drill-down: считаем среди
      // элементов, прошедших все ОСТАЛЬНЫЕ фасеты. Так «характер» виден
      // только когда в выборке есть рыбы/животные, а «освещённость» и «CO₂» —
      // только когда есть растения; выбранное значение всегда оставляем.
      facetGroups = FACET_KEYS.map((key) => {
        const present = new Set<string>();
        for (const item of list) {
          if (!itemMatches(item, key)) continue;
          const value = facetValue(item, key);
          if (value) present.add(value);
        }
        const selected = activeFacets[key];
        if (selected) present.add(selected);
        return { key, values: FACET_VALUES[key].filter((v) => present.has(v)) };
      }).filter((group) => group.values.length > 0);

      const filtered = list.filter((item) => itemMatches(item));
      filtered.sort((a, b) => {
        if (sort === "type") {
          const bySubtype = byTitle(subtypeLabel(a.subtype), subtypeLabel(b.subtype));
          if (bySubtype) return bySubtype;
        }
        return byTitle(a.title || "", b.title || "");
      });
      totalItems = filtered.length;
      const pageItems = filtered.slice((page - 1) * WIKI_PAGE_SIZE, page * WIKI_PAGE_SIZE);
      inhabitants = await Promise.all(
        pageItems.map(async (item) => ({ ...item, image: await refreshWikiImage(item.imageUrl) }))
      );
    }
  } catch (error) {
    console.error("Wiki API error:", error);
    failed = true;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / WIKI_PAGE_SIZE));

  const articleCovers = await Promise.all(
    articles.map((article) => refreshWikiImage(article.images[0]?.url))
  );

  return (
    <div className="app-container py-6 sm:py-10">
      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <h1 className="mb-2">{tHome("wiki-title")}</h1>
        <p className="measure text-sm text-muted-foreground sm:text-base">
          {tHome("wiki-description")}
        </p>
      </header>

      <div className="relative z-dropdown mb-6 max-w-xl animate-fade-in-up sm:mb-8">
        <WikiSearch />
      </div>

      <nav aria-label={tHome("wiki-title")} className="mb-4 flex flex-wrap gap-2">
        <Chip href={wikiHref({ tab: "articles", sort })} active={tab === "articles"}>
          <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("tabArticles")}
        </Chip>
        <Chip href={wikiHref({ tab: "inhabitants", sort })} active={tab === "inhabitants"}>
          <Fish className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("tabInhabitants")}
        </Chip>
      </nav>

      {/* Раздел (статьи) или тип аквариума (обитатели) — всегда на виду */}
      {!failed && (
        <div className="mb-4 flex flex-wrap gap-2 border-t border-surface-border pt-4">
          {tab === "articles" ? (
            <>
              <Chip href={wikiHref({ tab, sort })} active={!params.sub}>
                {t("all")}
              </Chip>
              {subCategories.map((sub) => (
                <Chip
                  key={sub.id}
                  href={wikiHref({ tab, sub: sub.id, sort })}
                  active={params.sub === sub.id}
                >
                  {sub.title}
                </Chip>
              ))}
            </>
          ) : (
            <>
              <Chip href={wikiHref({ tab, sort })} active={!type}>
                {t("all")}
              </Chip>
              {AQUARIUM_TYPES.map((value) => (
                <Chip
                  key={value}
                  href={wikiHref({ tab, type: value, sort })}
                  active={type === value}
                >
                  {typeLabel(value)}
                </Chip>
              ))}
            </>
          )}
        </div>
      )}

      {/* Сортировка — всегда на виду */}
      {!failed && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("sortBy")}
          </span>
          <Chip
            href={wikiHref({
              tab,
              sub: params.sub,
              type: params.type,
              sort: "az",
              ...activeFacets,
            })}
            active={sort === "az"}
          >
            {t("sortAlphabet")}
          </Chip>
          <Chip
            href={wikiHref({
              tab,
              sub: params.sub,
              type: params.type,
              sort: "type",
              ...activeFacets,
            })}
            active={sort === "type"}
          >
            {t("sortType")}
          </Chip>
        </div>
      )}

      {/* Остальные фильтры (фасеты обитателей) — под кнопкой «Фильтры» */}
      {!failed && facetGroups.length > 0 && (
        <FilterPanel label={t("filtersButton")} count={activeFacetCount}>
          {facetGroups.map((group) => {
            const selected = activeFacets[group.key];
            return (
              <div key={group.key} className="flex flex-wrap items-center gap-2">
                <span className="mr-1 w-full text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-28">
                  {facetLabel(group.key)}
                </span>
                <Chip href={facetHref(group.key, undefined)} active={!selected}>
                  {t("all")}
                </Chip>
                {group.values.map((value) => (
                  <Chip
                    key={value}
                    href={facetHref(group.key, selected === value ? undefined : value)}
                    active={selected === value}
                  >
                    {facetValueLabel(group.key, value)}
                  </Chip>
                ))}
              </div>
            );
          })}
        </FilterPanel>
      )}

      {failed ? (
        <EmptyState
          icon={<CloudOff className="h-10 w-10" />}
          title={t("unavailableTitle")}
          description={t("unavailableDescription")}
        />
      ) : tab === "articles" ? (
        articles.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {articles.map((article, index) => {
              const excerpt = articleExcerpt(article.description);
              return (
                <li
                  key={article.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
                >
                  <Link
                    href={`/wiki/${article.id}`}
                    className="surface-panel surface-interactive group flex h-full flex-col overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <WikiImage
                        src={articleCovers[index]}
                        alt=""
                        className="transition-transform duration-slow ease-out-soft group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="mb-2 line-clamp-2 text-base font-bold leading-snug sm:text-lg">
                        {article.title || t("untitled")}
                      </h2>
                      {excerpt && (
                        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
                      )}
                      {article.subCategories.some((sub) => sub.title) && (
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          {article.subCategories
                            .filter((sub) => sub.title)
                            .map((sub) => (
                              <span
                                key={sub.id}
                                className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                              >
                                {sub.title}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-10 w-10" />}
            title={t("noArticles")}
            description={t("emptyDescription")}
          />
        )
      ) : inhabitants.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {inhabitants.map((item, index) => {
            const scientificName = item.profile?.scientificName as string | undefined;
            const difficulty = item.profile?.difficulty as string | undefined;
            return (
              <li
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
              >
                <Link
                  href={`/wiki/inhabitants/${item.id}`}
                  className="surface-panel surface-interactive group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <WikiImage
                      src={item.image}
                      alt={item.title}
                      className="transition-transform duration-slow ease-out-soft group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                    <h2 className="line-clamp-2 text-sm font-bold leading-snug sm:text-base">
                      {item.title || t("untitled")}
                    </h2>
                    {scientificName && (
                      <p className="line-clamp-1 text-xs italic text-muted-foreground">
                        {scientificName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{subtypeLabel(item.subtype)}</p>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {difficulty && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {t(`options.difficulty.${difficulty}` as "options.difficulty.EASY")}
                        </span>
                      )}
                      {item.varietyCount ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {t("varietyCount", { n: item.varietyCount })}
                        </span>
                      ) : null}
                      {item.type.map((value) => (
                        <span
                          key={value}
                          className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                        >
                          {typeLabel(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<Fish className="h-10 w-10" />}
          title={t("noInhabitants")}
          description={t("emptyDescription")}
        />
      )}

      {!failed && totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-4 sm:mt-10"
          aria-label="pagination"
        >
          {page > 1 ? (
            <Link
              href={wikiHref({
                tab,
                sub: params.sub,
                type: params.type,
                sort,
                ...activeFacets,
                page: page - 1,
              })}
              scroll={false}
              className="tap-fast inline-flex h-10 items-center gap-1 rounded-full border border-surface-border px-4 text-sm font-medium transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center gap-1 rounded-full border border-surface-border px-4 text-sm font-medium opacity-40">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </span>
          )}

          <span data-numeric className="text-sm font-semibold text-muted-foreground">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={wikiHref({
                tab,
                sub: params.sub,
                type: params.type,
                sort,
                ...activeFacets,
                page: page + 1,
              })}
              scroll={false}
              className="tap-fast inline-flex h-10 items-center gap-1 rounded-full border border-surface-border px-4 text-sm font-medium transition-colors hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center gap-1 rounded-full border border-surface-border px-4 text-sm font-medium opacity-40">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
