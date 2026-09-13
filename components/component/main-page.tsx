import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Fish, Compass, BookOpen, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { fetchHomeStats } from "@/app/actions/homeStatsFetch";

/**
 * Главная — серверный компонент. Раньше это был "use client" с useSession +
 * useEffect: разметка приезжала пустой, счётчик аквариумов подгружался вторым
 * запросом уже в браузере, а числа на карточках Wiki/Discovery были константами
 * 250 и 1000. Теперь всё считается на сервере и приходит сразу с HTML.
 */
export async function MainPage() {
  const [t, session] = await Promise.all([
    getTranslations("HomePage"),
    auth(),
  ]);
  const stats = await fetchHomeStats(session?.user?.id);
  const isAuthed = Boolean(session?.user);

  const shortcuts = [
    {
      href: "/myTanks",
      icon: Fish,
      title: t("aquariums-title"),
      description: t("aquariums-description"),
      linkText: t("aquariums-link"),
      value: isAuthed ? stats.aquariums ?? 0 : null,
      valueLabel: t("statAquariums"),
      accent: "from-primary/20 to-primary/5 text-primary",
    },
    {
      href: "/discovery",
      icon: Compass,
      title: t("discovery-title"),
      description: t("discovery-description"),
      linkText: t("discovery-link"),
      value: stats.publicAquariums,
      valueLabel: t("statAquariums"),
      accent: "from-secondary/25 to-secondary/5 text-secondary",
    },
    {
      href: "/wiki",
      icon: BookOpen,
      title: t("wiki-title"),
      description: t("wiki-description"),
      linkText: t("wiki-link"),
      value: null,
      valueLabel: t("statSpecies"),
      accent: "from-accent/25 to-accent/5 text-accent",
    },
  ];

  return (
    <div className="app-container flex flex-col gap-10 py-6 sm:gap-14 sm:py-10">
      {/* ---------- Hero ---------- */}
      <section className="surface-panel-raised relative overflow-hidden p-6 sm:p-10 lg:p-14">
        {/* Декоративное свечение; не влияет на поток и скрыто от скринридеров */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
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
        </div>

        {/* Сводка показателей — только для авторизованных, иначе цифры пустые */}
        {isAuthed && (
          <dl className="relative mt-10 grid grid-cols-2 gap-3 sm:max-w-lg sm:gap-4">
            <div className="rounded-xl border border-surface-border bg-background/50 p-4">
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
            <div className="rounded-xl border border-surface-border bg-background/50 p-4">
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
      </section>

      {/* ---------- Быстрые переходы ---------- */}
      <section aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="mb-5 sm:mb-6">
          {t("sectionShortcuts")}
        </h2>

        {/* Сетка на самом контейнере: раньше col-span-* стояли на <Card>,
            которая была внуком грида, поэтому пропорции просто не работали */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {shortcuts.map(
            ({
              href,
              icon: Icon,
              title,
              description,
              linkText,
              value,
              valueLabel,
              accent,
            }) => (
              <li key={href} className="flex">
                <Link
                  href={href}
                  className="surface-panel surface-interactive group flex w-full flex-col p-5 sm:p-6"
                >
                  <span
                    className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${accent}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>

                  <h3 className="mb-2 text-lg sm:text-xl">{title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {description}
                  </p>

                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-surface-border pt-4">
                    {/* Энциклопедия ещё не подключена к бэкенду вики,
                        поэтому у неё счётчика нет — вместо выдуманного числа
                        показываем только действие */}
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
                </Link>
              </li>
            )
          )}
        </ul>
      </section>
    </div>
  );
}
