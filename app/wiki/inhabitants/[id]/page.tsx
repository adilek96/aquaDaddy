import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, MapPin } from "lucide-react";
import WikiImage from "@/components/component/wikiImage";
import { getInhabitant, refreshWikiImage } from "@/lib/wiki";
import {
  ARTICLE_SECTIONS,
  PROFILE_FIELDS,
  type DisplayField,
  type ProfileValue,
  type RangeValue,
  type TemplateContext,
} from "@/lib/wikiTemplate";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

type T = Awaited<ReturnType<typeof getTranslations<"Wiki">>>;

// У «света» и «течения» общий набор значений: низкий / средний / высокий
const OPTION_SET: Record<string, string> = { light: "level", flow: "level" };

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-success/15 text-success",
  MEDIUM: "bg-warning/15 text-warning",
  HARD: "bg-destructive/15 text-destructive",
};

/** Абзацы через пустую строку, строки с «- » — пункты списка. Без HTML. */
function renderText(text: string): ReactNode[] {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block, i) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((l) => /^[-•]\s+/.test(l))) {
        return (
          <ul key={i}>
            {lines.map((l, j) => (
              <li key={j}>{l.replace(/^[-•]\s+/, "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i}>
          {lines.map((l, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {l}
            </span>
          ))}
        </p>
      );
    });
}

function formatValue(
  field: DisplayField,
  value: ProfileValue,
  t: T,
  locale: string
): string | null {
  const num = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const option = (v: string) => {
    const key = `options.${OPTION_SET[field.key] ?? field.key}.${v}` as "options.level.LOW";
    return t.has(key) ? t(key) : v;
  };

  switch (field.kind) {
    case "range": {
      const { min, max } = value as RangeValue;
      const unit = field.unit ? ` ${t(`symbols.${field.unit}` as "symbols.celsius")}` : "";
      if (min !== undefined && max !== undefined) {
        return min === max ? `${num.format(min)}${unit}` : `${num.format(min)}–${num.format(max)}${unit}`;
      }
      if (min !== undefined) return t("from", { value: `${num.format(min)}${unit}` });
      if (max !== undefined) return t("to", { value: `${num.format(max)}${unit}` });
      return null;
    }
    case "number":
      return field.unit
        ? t(`units.${field.unit}` as "units.cm", { n: value as number })
        : num.format(value as number);
    case "select":
      return option(value as string);
    case "multi":
      return (value as string[]).map(option).join(", ");
    case "bool":
      return value ? t("yes") : t("no");
    default:
      return String(value);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const inhabitant = await getInhabitant(id, await getLocale());
    if (!inhabitant) return {};
    const overview = inhabitant.sections.overview?.replace(/\s+/g, " ").trim();
    return {
      title: `${inhabitant.title} - AquaDaddy`,
      description: overview ? overview.slice(0, 160) : undefined,
    };
  } catch {
    return {};
  }
}

export default async function WikiInhabitantPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Wiki");
  const tTypes = await getTranslations("Discovery");

  const inhabitant = await getInhabitant(id, locale);
  if (!inhabitant) notFound();

  const [image, gallery] = await Promise.all([
    refreshWikiImage(inhabitant.imageUrl),
    Promise.all(
      (inhabitant.gallery ?? []).map(async (item) => ({
        ...item,
        src: await refreshWikiImage(item.url),
      }))
    ),
  ]);
  const photos = gallery.filter((item) => item.src);
  const ctx: TemplateContext = { subtype: inhabitant.subtype, types: inhabitant.type };
  const profile = inhabitant.profile ?? {};
  const { sections } = inhabitant;

  const scientificName = profile.scientificName as string | undefined;
  const difficulty = profile.difficulty as string | undefined;

  const facts = PROFILE_FIELDS.filter((f) => f.show(ctx) && profile[f.key] !== undefined)
    .map((field) => {
      const labelKey = field.label ? field.label(ctx) : field.key;
      return {
        key: field.key,
        label: t(`profile.${labelKey}` as "profile.size"),
        value: formatValue(field, profile[field.key], t, locale),
      };
    })
    .filter((f) => f.value);

  const articleSections = ARTICLE_SECTIONS.filter(
    (s) => (!s.show || s.show(ctx)) && sections[s.key]?.trim()
  );

  const subtypeKey = `subtype.${inhabitant.subtype}` as "subtype.FISHS";

  return (
    <article className="app-container max-w-4xl py-6 sm:py-10">
      <Link
        href="/wiki?tab=inhabitants"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("backInhabitants")}
      </Link>

      <header className="mb-8 grid animate-fade-in-up gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center">
        <div className="surface-panel aspect-square overflow-hidden">
          <WikiImage src={image} alt={inhabitant.title} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-accent">
            {t.has(subtypeKey) ? t(subtypeKey) : inhabitant.subtype}
          </p>
          <h1 className="mb-1">{inhabitant.title || t("untitled")}</h1>
          {scientificName && (
            <p className="mb-4 text-lg italic text-muted-foreground">{scientificName}</p>
          )}

          <div className="mb-4 flex flex-wrap gap-1.5">
            {difficulty && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  DIFFICULTY_STYLE[difficulty] ?? "bg-muted"
                )}
              >
                {t(`options.difficulty.${difficulty}` as "options.difficulty.EASY")}
              </span>
            )}
            {inhabitant.type.map((type) => (
              <span
                key={type}
                className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
              >
                {tTypes(`aquariumType.${type.toLowerCase()}` as "aquariumType.freshwater")}
              </span>
            ))}
          </div>

          {sections.origin && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium text-foreground">{t("origin")}:</span>{" "}
                {sections.origin}
              </span>
            </p>
          )}
          {sections.otherNames && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t("otherNames")}:</span>{" "}
              {sections.otherNames}
            </p>
          )}
        </div>
      </header>

      {facts.length > 0 && (
        <section aria-labelledby="passport" className="mb-10">
          <h2 id="passport" className="mb-4 text-xl font-bold">
            {t("passport")}
          </h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.key} className="surface-panel p-3 sm:p-4">
                <dt className="mb-1 text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="font-semibold" data-numeric>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {photos.length > 0 && (
        <section aria-labelledby="gallery" className="mb-10">
          <h2 id="gallery" className="mb-4 text-xl font-bold">
            {t("gallery")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.url}>
                <figure className="surface-panel overflow-hidden">
                  <div className="aspect-[4/3] bg-muted">
                    <WikiImage src={photo.src} alt={inhabitant.title} />
                  </div>
                  {/* Для CC BY / CC BY-SA подпись с автором обязательна */}
                  {photo.credit && (
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                      {photo.sourceUrl ? (
                        <a
                          href={photo.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-2 hover:underline"
                        >
                          {photo.credit}
                        </a>
                      ) : (
                        photo.credit
                      )}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {articleSections.length > 0 ? (
        <div className="wiki-content">
          {articleSections.map((section) => {
            const labelKey = section.label ? section.label(ctx) : section.key;
            return (
              <section key={section.key}>
                <h2>{t(`sections.${labelKey}` as "sections.overview")}</h2>
                {renderText(sections[section.key] as string)}
              </section>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">{t("noArticle")}</p>
      )}
    </article>
  );
}
