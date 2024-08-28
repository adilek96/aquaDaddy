"use client";
import { useTranslations } from "next-intl";

export function StrapiErrors({ error }: { error: string }) {
  const t = useTranslations("ValidErrors");
  if (!error) return null;
  return (
    <div className="text-pink-500 text-md italic py-2">{t(`${error}`)}</div>
  );
}
