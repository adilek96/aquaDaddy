"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

/**
 * Решает, нужна ли вообще подсказка о стране.
 *
 * Сама карточка тянет за собой список из двух с лишним сотен стран, поэтому
 * её код загружается отдельным чанком и только тогда, когда страна не
 * выбрана. У всех остальных в бандл не попадает ничего, кроме этой проверки.
 */
const CountryPrompt = dynamic(() => import("./countryPrompt"), { ssr: false });

export default function CountryPromptGate() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") return null;
  if ((session?.user as { country?: string } | undefined)?.country) return null;

  return <CountryPrompt />;
}
