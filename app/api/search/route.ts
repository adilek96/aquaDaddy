import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { searchWiki } from "@/lib/wiki";

/**
 * Прокси живого поиска для браузера: сам бэкенд вики доступен только во
 * внутренней docker-сети (http://aqua-wiki:3000), наружу он не торчит.
 * Клиентский компонент дёргает этот маршрут по мере ввода.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const locale = searchParams.get("locale") || (await getLocale());

  if (q.length < 2) {
    return NextResponse.json({ articles: [], inhabitants: [] });
  }

  try {
    const results = await searchWiki(q, locale);
    return NextResponse.json(results, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Search route error:", error);
    return NextResponse.json({ articles: [], inhabitants: [] }, { status: 502 });
  }
}
