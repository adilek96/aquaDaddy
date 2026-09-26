import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import WikiImage from "@/components/component/wikiImage";
import { articleExcerpt, getArticle, refreshWikiImage, renderArticleHtml } from "@/lib/wiki";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const article = await getArticle(id, await getLocale());
    if (!article) return {};
    return {
      title: `${article.title} - AquaDaddy`,
      description: articleExcerpt(article.description, 160) || undefined,
    };
  } catch {
    return {};
  }
}

export default async function WikiArticlePage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Wiki");

  const article = await getArticle(id, locale);
  if (!article) notFound();

  const [html, cover] = await Promise.all([
    renderArticleHtml(article.description),
    refreshWikiImage(article.images[0]?.url),
  ]);

  return (
    <article className="app-container max-w-3xl py-6 sm:py-10">
      <Link
        href="/wiki"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <header className="mb-6 animate-fade-in-up">
        <h1 className="mb-3">{article.title || t("untitled")}</h1>
        {article.subCategories.some((sub) => sub.title) && (
          <div className="flex flex-wrap gap-1.5">
            {article.subCategories
              .filter((sub) => sub.title)
              .map((sub) => (
                <Link
                  key={sub.id}
                  href={`/wiki?sub=${sub.id}`}
                  className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent hover:bg-accent/20"
                >
                  {sub.title}
                </Link>
              ))}
          </div>
        )}
      </header>

      {cover && (
        <div className="surface-panel mb-8 aspect-[16/9] overflow-hidden">
          <WikiImage src={cover} alt={article.title} />
        </div>
      )}

      {html ? (
        <div className="wiki-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-muted-foreground">{t("noContent")}</p>
      )}
    </article>
  );
}
