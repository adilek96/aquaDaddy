import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Fish, Compass, BookOpen, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { fetchHomeStats } from "@/app/actions/homeStatsFetch";
import Image from "next/image";
import heroTank from "@/public/hero-tank.jpg";
import { CardIllustration, WaveDivider } from "@/components/illustrations/decor";
import { NeonSchool } from "@/components/illustrations/neonSchool";

export async function MainPage() {
  const [t, session] = await Promise.all([getTranslations("HomePage"), auth()]);
  const stats = await fetchHomeStats(session?.user?.id);
  const isAuthed = Boolean(session?.user);

  const shortcuts = [
    {
      href: "/myTanks",
      art: "tanks" as const,
      icon: Fish,
      title: t("aquariums-title"),
      description: t("aquariums-description"),
      linkText: t("aquariums-link"),
      value: isAuthed ? (stats.aquariums ?? 0) : null,
      valueLabel: t("statAquariums"),
      badge: "text-primary",
    },
    {
      href: "/discovery",
      art: "discovery" as const,
      icon: Compass,
      title: t("discovery-title"),
      description: t("discovery-description"),
      linkText: t("discovery-link"),
      value: stats.publicAquariums,
      valueLabel: t("statAquariums"),
      badge: "text-accent",
    },
    {
      href: "/wiki",
      art: "wiki" as const,
      icon: BookOpen,
      title: t("wiki-title"),
      description: t("wiki-description"),
      linkText: t("wiki-link"),
      value: null,
      valueLabel: t("statSpecies"),
      badge: "text-success",
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-4 sm:gap-12">
      {/* ================= Hero ================= */}
      <section className="relative overflow-hidden">
        {/* Стайка неонов в фоне. Лежит первой в разметке и без z-index,
            поэтому оказывается под контентом, у которого z-raised */}
        <NeonSchool className="absolute inset-0 h-full w-full" />

        <div className="app-container relative grid items-center gap-6 pb-16 pt-6 sm:gap-8 sm:pb-20 sm:pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-24">
          {/* --- Текстовая колонка --- */}
          <div className="relative z-raised max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-primary" />
              AquaDaddy
            </p>

            <h1 className="mb-4">{t("heroTitle")}</h1>

            <p className="measure mb-8 text-base text-muted-foreground sm:text-lg">
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={isAuthed ? "/myTanks" : "/signIn"}>
                  {isAuthed ? t("heroCta") : t("signInToView")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/discovery">{t("heroCtaSecondary")}</Link>
              </Button>
            </div>

            {/* Сводка — только для авторизованных, иначе цифры пустые */}
            {isAuthed && (
              <dl className="mt-9 grid max-w-md grid-cols-2 gap-3 sm:gap-4">
                <div className="surface-panel p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Fish className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t("statAquariums")}
                  </dt>
                  <dd
                    data-numeric
                    className="mt-1 font-display text-3xl font-extrabold"
                  >
                    {stats.aquariums ?? 0}
                  </dd>
                </div>
                <div className="surface-panel p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <CalendarClock
                      className="h-4 w-4 text-warning"
                      aria-hidden="true"
                    />
                    {t("statUpcoming")}
                  </dt>
                  <dd
                    data-numeric
                    className="mt-1 font-display text-3xl font-extrabold"
                  >
                    {stats.upcomingMaintenance ?? 0}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* --- Фотография аквариума ---
              На телефоне идёт под текстом: она украшает экран, но не должна
              отодвигать кнопки за первый экран */}
          <div className="relative z-raised mx-auto w-full max-w-xl lg:max-w-none">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 translate-y-6 rounded-3xl bg-primary/25 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-surface-border shadow-raised">
              {/* Статический импорт: Next сам знает размеры (нет сдвига
                  вёрстки) и сам делает размытую заглушку на время загрузки.
                  priority — картинка и есть LCP-элемент страницы. */}
              <Image
                src={heroTank}
                alt={t("heroImageAlt")}
                priority
                placeholder="blur"
                sizes="(max-width: 1023px) 92vw, 46vw"
                className="h-auto w-full"
              />
              {/* Лёгкий блик по стеклу, чтобы фотография не выглядела
                  инородной плашкой среди стеклянных панелей интерфейса */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/15"
              />
            </div>
          </div>
        </div>

        {/* Волна отделяет hero от остальной страницы */}
        <WaveDivider
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full sm:h-24"
        />
      </section>

      {/* ================= Разделы ================= */}
      <section aria-labelledby="shortcuts-heading" className="app-container">
        <h2 id="shortcuts-heading" className="mb-5 sm:mb-7">
          {t("sectionShortcuts")}
        </h2>

        {/* Сетка объявлена на самом контейнере: до редизайна col-span-*
            стояли на <Card>, которая была внуком грида, и не работали */}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map(
            ({
              href,
              art,
              icon: Icon,
              title,
              description,
              linkText,
              value,
              valueLabel,
              badge,
            }) => (
              <li key={href} className="flex">
                <Link
                  href={href}
                  className="surface-panel surface-interactive group flex w-full flex-col overflow-hidden"
                >
                  {/* Иллюстрированная шапка вместо простого цветного квадрата */}
                  <span className="relative block h-28 w-full overflow-hidden sm:h-32">
                    <CardIllustration art={art} />
                    <span className="absolute bottom-2 left-5 grid h-11 w-11 place-items-center rounded-xl border border-surface-border bg-surface shadow-soft transition-transform duration-base ease-out-soft group-hover:-translate-y-1">
                      <Icon className={`h-5 w-5 ${badge}`} aria-hidden="true" />
                    </span>
                  </span>

                  <span className="flex flex-1 flex-col p-5 pt-4">
                    <span className="mb-2 font-display text-lg font-bold tracking-tight sm:text-xl">
                      {title}
                    </span>
                    <span className="mb-6 text-sm text-muted-foreground">
                      {description}
                    </span>

                    <span className="mt-auto flex items-center justify-between gap-3 border-t border-surface-border pt-4">
                      {/* У энциклопедии счётчика нет: раздел ещё не подключён
                          к aquaWikiBackend, а выдуманное число там стояло
                          захардкоженным («250») */}
                      {value !== null ? (
                        <span className="flex items-baseline gap-1.5">
                          <span
                            data-numeric
                            className="font-display text-2xl font-extrabold"
                          >
                            {value}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {valueLabel}
                          </span>
                        </span>
                      ) : (
                        <span aria-hidden="true" />
                      )}

                      <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                        {linkText}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-fast ease-out-soft group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            )
          )}
        </ul>
      </section>
    </div>
  );
}
