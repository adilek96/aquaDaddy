"use client";
import { useTranslations } from "next-intl";

export function ZodErrors({ error }: { error: string[] }) {
  const t = useTranslations("ZodErrors");
  if (!error) return null;
  return error.map((err: string, index: number) => (
    <div key={index} className="text-pink-500 text-xs italic mt-1 py-2">
      {err}
    </div>
  ));
}
