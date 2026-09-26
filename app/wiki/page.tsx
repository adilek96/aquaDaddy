import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, CloudOff, Fish } from "lucide-react";
import { generateWikiMetadata } from "@/components/helpers/MetaTags";
import { EmptyState } from "@/components/ui/empty-state";
import WikiImage from "@/components/component/wikiImage";
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

type SearchParams = { tab?: string; sub?: string; type?: string };

function wikiHref(params: { tab: Tab; sub?: string; type?: string }) {
  const search = new URLSearchParams();
  if (params.tab !== "articles") search.set("tab", params.tab);
  if (params.sub) search.set("sub", params.sub);
  if (params.type) search.set("type", params.type);
  const qs = search.toString();
  return qs ? `/wiki?${qs}` : "/wiki";
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

  let articles: WikiArticle[] = [];
  let inhabitants: (WikiInhabitant & { image: string | null })[] = [];
  let subCategories: WikiSubCategory[] = [];
  let failed = false;

  try {
    if (tab === "articles") {
      [articles, subCategories] = await Promise.all([
        getArticles(locale, params.sub),
        getSubCategories(locale),
      ]);
    } else {
      const list = await getInhabitants(locale, type);
      inhabitants = await Promise.all(
        list.map(async (item) => ({ ...item, image: await refreshWikiImage(item.imageUrl) }))
      );
    }
  } catch (error) {
    console.error("Wiki API error:", error);
    failed = true;
  }

  const articleCovers = await Promise.all(
    articles.map((article) => refreshWikiImage(article.images[0]?.url))
  );

  const typeLabel = (value: AquariumType) =>
    tTypes(`aquariumType.${value.toLowerCase()}` as "aquariumType.freshwater");

  const subtypeLabel = (value: string) =>
    t.has(`subtype.${value}` as "subtype.FISHS") ? t(`subtype.${value}` as "subtype.FISHS") : value;

  return (
    <div className="app-container py-6 sm:py-10">
      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <h1 className="mb-2">{tHome("wiki-title")}</h1>
        <p className="measure text-sm text-muted-foreground sm:text-base">
          {tHome("wiki-description")}
        </p>
      </header>

      <nav aria-label={tHome("wiki-title")} className="mb-4 flex flex-wrap gap-2">
        <Chip href={wikiHref({ tab: "articles" })} active={tab === "articles"}>
          <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("tabArticles")}
        </Chip>
        <Chip href={wikiHref({ tab: "inhabitants" })} active={tab === "inhabitants"}>
          <Fish className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("tabInhabitants")}
        </Chip>
      </nav>

      {!failed && (
        <div className="mb-6 flex flex-wrap gap-2 border-t border-surface-border pt-4 sm:mb-8">
          {tab === "articles" ? (
            <>
              <Chip href={wikiHref({ tab })} active={!params.sub}>
                {t("all")}
              </Chip>
              {subCategories.map((sub) => (
                <Chip
                  key={sub.id}
                  href={wikiHref({ tab, sub: sub.id })}
                  active={params.sub === sub.id}
                >
                  {sub.title}
                </Chip>
              ))}
            </>
          ) : (
            <>
              <Chip href={wikiHref({ tab })} active={!type}>
                {t("all")}
              </Chip>
              {AQUARIUM_TYPES.map((value) => (
                <Chip key={value} href={wikiHref({ tab, type: value })} active={type === value}>
                  {typeLabel(value)}
                </Chip>
              ))}
            </>
          )}
        </div>
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
    </div>
  );
}
