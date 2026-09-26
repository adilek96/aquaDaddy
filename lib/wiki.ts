import sanitizeHtml from "sanitize-html";
import { getMinioClient, PRESIGNED_TTL_SECONDS, signingDate } from "@/lib/minio";
import {
  SECTION_KEYS,
  type InhabitantProfile,
  type InhabitantSections,
  type SectionKey,
} from "@/lib/wikiTemplate";

/**
 * Клиент aquaWikiBackend. Энциклопедию наполняют через aquaDashboard,
 * сайт её только читает.
 *
 * На сервере WIKI_API_URL указывает на контейнер (http://aqua-wiki:3000):
 * публичные имена изнутри контейнеров не резолвятся.
 */
const API_URL = (
  process.env.WIKI_API_URL || "https://wiki-api.aquadaddy.app"
).replace(/\/+$/, "");

/** Ответы API и так кэшируются в Redis на 5 минут — держим тот же срок. */
const REVALIDATE_SECONDS = 300;

/** Основной язык наполнения: переводы на другие языки часто пустые. */
const FALLBACK_LOCALE = "ru";

const WIKI_BUCKET = process.env.MINIO_BUCKET_WIKI || "article-images";

export const AQUARIUM_TYPES = ["FRESHWATER", "SALTWATER", "PALUDARIUM"] as const;
export type AquariumType = (typeof AQUARIUM_TYPES)[number];

export type WikiSubCategory = { id: string; title: string };

export type WikiArticle = {
  id: string;
  title: string;
  /** Сырой текст из API: JSON Editor.js с HTML внутри блоков. */
  description: string;
  subCategories: WikiSubCategory[];
  images: { id: string; url: string }[];
};

export type WikiInhabitant = {
  id: string;
  type: AquariumType[];
  subtype: string;
  title: string;
  imageUrl: string;
  articleUrl: string;
  profile: InhabitantProfile | null;
  gallery?: { url: string; credit?: string; sourceUrl?: string }[];
  /** id вида, если это подвид или порода. */
  parentId?: string | null;
  varietyCount?: number;
};

export type WikiRelative = { id: string; title: string; imageUrl: string };

export type WikiInhabitantDetails = WikiInhabitant & {
  sections: InhabitantSections;
  parent?: WikiRelative | null;
  varieties?: WikiRelative[];
  /** Разделы, которые у подвида пустые и взяты у вида. */
  inheritedSections?: SectionKey[];
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Wiki API ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Заполняет пустые поля перевода значениями из основного языка. */
function withFallback<T extends { id: string }>(
  items: T[],
  fallback: T[],
  merge: (item: T, base: T) => T
): T[] {
  const byId = new Map(fallback.map((item) => [item.id, item]));
  return items.map((item) => {
    const base = byId.get(item.id);
    return base ? merge(item, base) : item;
  });
}

function mergeArticle(item: WikiArticle, base: WikiArticle): WikiArticle {
  const baseSubs = new Map(base.subCategories.map((s) => [s.id, s.title]));
  return {
    ...item,
    title: item.title || base.title,
    description: hasContent(item.description) ? item.description : base.description,
    subCategories: item.subCategories.map((s) => ({
      ...s,
      title: s.title || baseSubs.get(s.id) || "",
    })),
  };
}

function mergeInhabitant(item: WikiInhabitant, base: WikiInhabitant): WikiInhabitant {
  return { ...item, title: item.title || base.title };
}

type ArticlesResponse = { articles: WikiArticle[] };
type ArticleResponse = { article: WikiArticle };
type InhabitantsResponse = { inhabitants: WikiInhabitant[] };
type SubCategoriesResponse = {
  subcategories: {
    id: string;
    translations: { locale: string; title: string }[];
  }[];
};

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

export async function getArticles(
  locale: string,
  subCategoryId?: string
): Promise<WikiArticle[]> {
  const load = (l: string) =>
    getJson<ArticlesResponse>(`/articles?${query({ locale: l, subCategoryId })}`).then(
      (r) => r.articles
    );

  if (locale === FALLBACK_LOCALE) return load(locale);
  const [items, fallback] = await Promise.all([load(locale), load(FALLBACK_LOCALE)]);
  return withFallback(items, fallback, mergeArticle);
}

export async function getArticle(
  id: string,
  locale: string
): Promise<WikiArticle | null> {
  const load = async (l: string) => {
    const res = await fetch(
      `${API_URL}/articles/article/${encodeURIComponent(id)}?${query({ locale: l })}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Wiki API article ${id}: ${res.status}`);
    return ((await res.json()) as ArticleResponse).article;
  };

  if (locale === FALLBACK_LOCALE) return load(locale);
  const [item, base] = await Promise.all([load(locale), load(FALLBACK_LOCALE)]);
  return item && base ? mergeArticle(item, base) : item;
}

export async function getInhabitants(
  locale: string,
  type?: AquariumType
): Promise<WikiInhabitant[]> {
  const load = (l: string) =>
    // parents=1: в списке энциклопедии только виды, подвиды — на странице вида
    getJson<InhabitantsResponse>(`/inhabitants?${query({ locale: l, type, parents: "1" })}`).then(
      (r) => r.inhabitants
    );

  if (locale === FALLBACK_LOCALE) return load(locale);
  const [items, fallback] = await Promise.all([load(locale), load(FALLBACK_LOCALE)]);
  return withFallback(items, fallback, mergeInhabitant);
}

/**
 * Обитатель со статьёй. Пустые разделы берутся из русской версии, а у подвида
 * пустые поля паспорта и разделы — у вида: подвиду достаточно описать отличия.
 */
export async function getInhabitant(
  id: string,
  locale: string
): Promise<WikiInhabitantDetails | null> {
  const item = await getLocalizedInhabitant(id, locale);
  if (!item?.parentId) return item;

  const parent = await getLocalizedInhabitant(item.parentId, locale);
  if (!parent) return item;

  const inheritedSections = SECTION_KEYS.filter(
    (key) => !item.sections[key] && parent.sections[key]
  );
  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, item.sections[key] || parent.sections[key] || null])
  ) as InhabitantSections;

  return {
    ...item,
    profile: { ...(parent.profile ?? {}), ...(item.profile ?? {}) },
    sections,
    inheritedSections,
    parent: item.parent ? { ...item.parent, title: item.parent.title || parent.title } : null,
  };
}

async function getLocalizedInhabitant(
  id: string,
  locale: string
): Promise<WikiInhabitantDetails | null> {
  const load = async (l: string) => {
    const res = await fetch(
      `${API_URL}/inhabitants/inhabitant/${encodeURIComponent(id)}?${query({ locale: l })}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Wiki API inhabitant ${id}: ${res.status}`);
    return ((await res.json()) as { inhabitant: WikiInhabitantDetails }).inhabitant;
  };

  if (locale === FALLBACK_LOCALE) return load(locale);
  const [item, base] = await Promise.all([load(locale), load(FALLBACK_LOCALE)]);
  if (!item || !base) return item;

  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, item.sections?.[key] || base.sections?.[key] || null])
  ) as InhabitantSections;

  const baseTitles = new Map(
    [base.parent, ...(base.varieties ?? [])].flatMap((r) => (r ? [[r.id, r.title] as const] : []))
  );
  const withTitle = (r: WikiRelative) => ({ ...r, title: r.title || baseTitles.get(r.id) || "" });

  return {
    ...item,
    title: item.title || base.title,
    sections,
    parent: item.parent ? withTitle(item.parent) : item.parent,
    varieties: item.varieties?.map(withTitle),
  };
}

/**
 * Подкатегории без параметра lang: так API отдаёт все переводы сразу,
 * и название можно взять на нужном языке, а при его отсутствии — на русском.
 */
export async function getSubCategories(locale: string): Promise<WikiSubCategory[]> {
  const { subcategories } = await getJson<SubCategoriesResponse>("/subcategories");
  return subcategories
    .map((sub) => {
      const pick = (l: string) => sub.translations.find((t) => t.locale === l)?.title;
      return {
        id: sub.id,
        title: pick(locale) || pick(FALLBACK_LOCALE) || sub.translations[0]?.title || "",
      };
    })
    .filter((sub) => sub.title);
}

/**
 * Дашборд сохраняет в базу подписанные ссылки MinIO со сроком 7 дней,
 * поэтому каждую ссылку на наш бакет подписываем заново. Ссылки на
 * localhost и blob: оставлены редактором по ошибке — их отбрасываем.
 */
export async function refreshWikiImage(
  url: string | null | undefined
): Promise<string | null> {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) return null;

  const [bucket, ...keyParts] = parsed.pathname.split("/").filter(Boolean);
  if (bucket === WIKI_BUCKET && keyParts.length > 0) {
    try {
      // Подпись считается локально, в хранилище не ходит (регион задан).
      // Дата округлена до суток, иначе ссылка меняется в каждом ответе и
      // браузер качает одну и ту же картинку заново.
      return await getMinioClient().presignedGetObject(
        WIKI_BUCKET,
        keyParts.map(decodeURIComponent).join("/"),
        PRESIGNED_TTL_SECONDS,
        { "response-cache-control": "public, max-age=86400, immutable" },
        signingDate()
      );
    } catch {
      return null;
    }
  }

  return parsed.protocol === "https:" ? url : null;
}

type EditorBlock = {
  type?: string;
  data?: {
    text?: string;
    level?: number;
    style?: string;
    items?: (string | { content?: string })[];
    caption?: string;
    file?: { url?: string };
    url?: string;
  };
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Собирает HTML из блоков Editor.js; не-JSON считается готовым HTML. */
function descriptionToHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  let doc: { blocks?: EditorBlock[] } | null = null;
  if (trimmed.startsWith("{")) {
    try {
      doc = JSON.parse(trimmed);
    } catch {
      doc = null;
    }
  }

  if (!doc || !Array.isArray(doc.blocks)) {
    return /<[a-z][\s\S]*>/i.test(trimmed)
      ? trimmed
      : trimmed
          .split(/\n{2,}/)
          .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
          .join("");
  }

  return doc.blocks
    .map((block) => {
      const data = block.data ?? {};
      switch (block.type) {
        case "header": {
          const level = Math.min(Math.max(data.level ?? 2, 2), 4);
          return `<h${level}>${data.text ?? ""}</h${level}>`;
        }
        case "list": {
          const tag = data.style === "ordered" ? "ol" : "ul";
          const items = (data.items ?? [])
            .map((item) => `<li>${typeof item === "string" ? item : item.content ?? ""}</li>`)
            .join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "quote":
          return `<blockquote>${data.text ?? ""}</blockquote>`;
        case "image": {
          const src = data.file?.url ?? data.url;
          return src
            ? `<figure><img src="${escapeHtml(src)}" alt=""><figcaption>${data.caption ?? ""}</figcaption></figure>`
            : "";
        }
        default:
          // paragraph: в тексте уже лежит HTML целых блоков (<h1>, <p>, <img>)
          return `<div>${data.text ?? ""}</div>`;
      }
    })
    .join("");
}

/** Безопасный HTML статьи с переподписанными картинками. */
export async function renderArticleHtml(raw: string): Promise<string> {
  const html = descriptionToHtml(raw);

  // sanitize-html синхронный, а подпись ссылки — нет: подписываем заранее
  const sources = Array.from(
    new Set(Array.from(html.matchAll(/<img[^>]*?\ssrc="([^"]*)"/gi), (m) => m[1]))
  );
  const refreshed = new Map(
    await Promise.all(
      sources.map(async (src) => {
        const decoded = src.replace(/&amp;/g, "&");
        return [decoded, await refreshWikiImage(decoded)] as const;
      })
    )
  );

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "div", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "a", "ul", "ol", "li", "blockquote", "code", "pre", "img", "figure", "figcaption",
    ],
    allowedAttributes: { a: ["href", "rel", "target"], img: ["src", "alt", "loading"] },
    allowedSchemes: ["http", "https"],
    transformTags: {
      // h1 на странице — заголовок статьи; редактор же ставит h1 внутрь текста
      h1: "h2",
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
      img: (tagName, attribs) => {
        const src = attribs.src ? refreshed.get(attribs.src) : null;
        const next: sanitizeHtml.Attributes = src
          ? { src, alt: attribs.alt ?? "", loading: "lazy" }
          : {};
        return { tagName, attribs: next };
      },
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !frame.attribs.src) ||
      // Редактор оставляет пустые <p></p> между блоками
      (["p", "div", "figcaption"].includes(frame.tag) &&
        !frame.text.trim() &&
        !frame.mediaChildren.length),
  });
}

/** Текст без разметки — для превью в карточке. */
export function articleExcerpt(raw: string, maxLength = 180): string {
  const text = sanitizeHtml(descriptionToHtml(raw), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function hasContent(raw: string): boolean {
  return articleExcerpt(raw).length > 0 || /<img/i.test(descriptionToHtml(raw));
}
