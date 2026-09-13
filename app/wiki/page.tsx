import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Compass, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWikiMetadata } from "@/components/helpers/MetaTags";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  return generateWikiMetadata(locale);
}

/**
 * Энциклопедия ещё не подключена к aquaWikiBackend: статьи живут в отдельном
 * сервисе, и в aquaDaddy нет ни одного обращения к нему. Раньше страница
 * показывала карточку со ссылкой href="#" и счётчиком «250» — выглядело как
 * рабочий раздел, который никуда не ведёт. Пока честно говорим, что раздел
 * готовится, и уводим туда, где контент действительно есть.
 */
export default async function Wiki() {
  const t = await getTranslations("HomePage");

  return (
    <div className="app-container flex min-h-[60dvh] items-center justify-center py-10">
      <div className="surface-panel-raised w-full max-w-xl animate-fade-in-up p-6 text-center sm:p-10">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
          <BookOpen className="h-8 w-8" aria-hidden="true" />
        </span>

        <h1 className="mb-3">{t("wiki-title")}</h1>
        <p className="measure mx-auto mb-8 text-muted-foreground">
          {t("wiki-description")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/discovery">
              <Compass className="h-4 w-4" aria-hidden="true" />
              {t("discovery-link")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/myTanks">
              <Fish className="h-4 w-4" aria-hidden="true" />
              {t("aquariums-link")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
