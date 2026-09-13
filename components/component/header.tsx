"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Fish, Compass, BookOpen, Menu, X } from "lucide-react";
import LanguageToggle from "./languageToggle";
import { UserMenu } from "./userMenu";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type NavItem = {
  href: string;
  labelKey: string;
  icon: typeof Fish;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/myTanks", labelKey: "aquariums-title", icon: Fish },
  { href: "/discovery", labelKey: "discovery-title", icon: Compass },
  { href: "/wiki", labelKey: "wiki-title", icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const tHome = useTranslations("HomePage");
  const tHeader = useTranslations("Header");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Шапка становится плотнее при скролле — даёт ощущение слоя над контентом
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Меню закрывается при переходе, иначе оно остаётся висеть поверх новой страницы
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape закрывает меню, фон не скроллится под открытым меню
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-header border-b transition-[background-color,box-shadow,border-color] duration-base ease-out-soft",
        scrolled
          ? "border-surface-border bg-background/80 shadow-soft backdrop-blur-xl"
          : "border-transparent bg-background/50 backdrop-blur-md"
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <nav
        aria-label={tHeader("nav")}
        className="app-container flex h-16 items-center gap-2"
      >
        {/* Логотип-ссылка домой заменяет прежнюю кнопку «домой/назад»,
            которая вычисляла маршрут через pathname.substring(4) */}
        {/* Фирменный знак проекта из /public/app-logo.svg */}
        <Link
          href="/"
          className="group flex shrink-0 items-center rounded-lg p-1"
          aria-label={tHeader("home")}
        >
          {/* app-logo-mark.svg — тот же знак, но с обрезанными пустыми
              полями. В исходном app-logo.svg графика занимает лишь 39%
              высоты файла, поэтому увеличение бокса раздувало отступы,
              а сам знак почти не рос. Здесь он заполняет холст целиком,
              и высота бокса = высоте видимого знака. Пропорции 1.94:1,
              поэтому ширину отдаём авто. */}
          <Image
            src="/app-logo-mark.svg"
            alt="AquaDaddy"
            width={305}
            height={157}
            priority
            className="h-10 w-auto transition-transform duration-fast ease-out-soft group-hover:scale-105"
          />
        </Link>

        {/* Десктопная навигация */}
        <ul className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors duration-fast",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tHome(labelKey as any)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <UserMenu />

          {/* Кнопка мобильного меню — 44×44 минимум под палец */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? tHeader("closeMenu") : tHeader("openMenu")}
            className="grid h-11 w-11 place-items-center rounded-lg text-foreground transition-colors duration-fast hover:bg-muted md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Мобильная навигация: раскрывается под шапкой, пункты с иконкой и подписью */}
      <div
        id="mobile-nav"
        hidden={!mobileOpen}
        className="border-t border-surface-border bg-background/95 backdrop-blur-xl md:hidden"
      >
        <ul className="app-container flex flex-col gap-1 py-3">
          {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-base font-semibold transition-colors duration-fast",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {tHome(labelKey as any)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
