/**
 * Шаблон страницы обитателя: какие поля паспорта и разделы показывать для
 * какого подтипа. Ключи — те же, что в aquaWikiBackend/src/lib/inhabitantProfile.ts
 * и aquaDashboard/lib/inhabitant-template.ts. Подписи — в messages/*.json (Wiki.profile).
 */

export type Group = "FISH" | "INVERT" | "PLANT" | "CORAL" | "TERRA";

export function groupOf(subtype: string): Group {
  switch (subtype) {
    case "FISHS":
      return "FISH";
    case "PLANTS":
      return "PLANT";
    case "CORALS":
      return "CORAL";
    case "REPTILES":
    case "AMPHIBIANS":
    case "TURTLES":
    case "FROGS":
      return "TERRA";
    default:
      return "INVERT";
  }
}

export type TemplateContext = { subtype: string; types: string[] };

export type RangeValue = { min?: number; max?: number };
export type ProfileValue = string | number | boolean | string[] | RangeValue;
export type InhabitantProfile = Record<string, ProfileValue>;

/**
 * unit — ключ в Wiki.units: для диапазонов это обозначение («°C»),
 * для чисел — сообщение с плюрализацией («{n} лет»).
 */
export type DisplayField = {
  key: string;
  kind: "text" | "number" | "range" | "select" | "multi" | "bool";
  unit?: string;
  /** Ключ подписи в Wiki.profile; по умолчанию — key. */
  label?: (ctx: TemplateContext) => string;
  show: (ctx: TemplateContext) => boolean;
};

const is =
  (...groups: Group[]) =>
  (ctx: TemplateContext) =>
    groups.includes(groupOf(ctx.subtype));
const always = () => true;

/** Сложность и научное название выводятся в шапке, не в таблице. */
export const PROFILE_FIELDS: DisplayField[] = [
  {
    key: "size",
    kind: "number",
    unit: "cm",
    label: (ctx) => (groupOf(ctx.subtype) === "PLANT" ? "height" : "size"),
    show: always,
  },
  { key: "lifespan", kind: "number", unit: "years", show: is("FISH", "INVERT", "TERRA") },
  {
    key: "minVolume",
    kind: "number",
    unit: "liters",
    label: (ctx) => (groupOf(ctx.subtype) === "TERRA" ? "minVolumeTerra" : "minVolume"),
    show: is("FISH", "INVERT", "CORAL", "TERRA"),
  },
  {
    key: "temperature",
    kind: "range",
    unit: "celsius",
    label: (ctx) => (groupOf(ctx.subtype) === "TERRA" ? "waterTemperature" : "temperature"),
    show: always,
  },
  { key: "ph", kind: "range", show: is("FISH", "INVERT", "PLANT", "CORAL") },
  { key: "gh", kind: "range", unit: "dh", show: is("FISH", "INVERT", "PLANT") },
  { key: "kh", kind: "range", unit: "dh", show: is("FISH", "INVERT", "PLANT", "CORAL") },
  { key: "salinity", kind: "range", show: (ctx) => ctx.types.includes("SALTWATER") },
  { key: "calcium", kind: "range", unit: "mgl", show: is("CORAL") },
  { key: "magnesium", kind: "range", unit: "mgl", show: is("CORAL") },
  { key: "temperament", kind: "select", show: is("FISH", "INVERT", "TERRA") },
  { key: "social", kind: "select", show: is("FISH") },
  { key: "groupSize", kind: "number", unit: "individuals", show: is("FISH", "INVERT") },
  { key: "swimZone", kind: "multi", show: is("FISH") },
  { key: "diet", kind: "select", show: is("FISH", "INVERT", "TERRA") },
  { key: "jumps", kind: "bool", show: is("FISH") },
  { key: "eatsPlants", kind: "bool", show: is("FISH", "INVERT") },
  { key: "copperSensitive", kind: "bool", show: is("INVERT") },
  { key: "light", kind: "select", show: is("PLANT", "CORAL") },
  { key: "co2", kind: "select", show: is("PLANT") },
  { key: "growth", kind: "select", show: is("PLANT", "CORAL") },
  { key: "placement", kind: "multi", show: is("PLANT") },
  { key: "flow", kind: "select", show: is("CORAL") },
  { key: "stinging", kind: "bool", show: is("CORAL") },
  { key: "coralFeeding", kind: "select", show: is("CORAL") },
  { key: "airTemperature", kind: "range", unit: "celsius", show: is("TERRA") },
  { key: "humidity", kind: "range", unit: "percent", show: is("TERRA") },
  {
    key: "needsLand",
    kind: "bool",
    show: (ctx) => groupOf(ctx.subtype) === "TERRA" || ctx.subtype === "CRABS",
  },
  { key: "uvb", kind: "bool", show: is("TERRA") },
];

export const SECTION_KEYS = [
  "otherNames",
  "origin",
  "overview",
  "appearance",
  "care",
  "feeding",
  "compatibility",
  "breeding",
  "facts",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
export type InhabitantSections = Record<SectionKey, string | null>;

/** Разделы статьи в порядке вывода; otherNames и origin идут в шапку. */
export const ARTICLE_SECTIONS: {
  key: SectionKey;
  label?: (ctx: TemplateContext) => string;
  show?: (ctx: TemplateContext) => boolean;
}[] = [
  { key: "overview" },
  { key: "appearance" },
  { key: "care" },
  {
    key: "feeding",
    label: (ctx) => (groupOf(ctx.subtype) === "PLANT" ? "fertilizing" : "feeding"),
  },
  { key: "compatibility", show: (ctx) => groupOf(ctx.subtype) !== "PLANT" },
  { key: "breeding" },
  { key: "facts" },
];
