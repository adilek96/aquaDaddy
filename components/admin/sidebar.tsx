"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Droplets, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Пункты «Media» и «Settings» вели на /admin/media и /admin/settings —
 * таких маршрутов в проекте нет, обе ссылки открывали 404. Убраны до
 * появления страниц: ссылка в никуда хуже, чем её отсутствие.
 */
const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/aquariums", icon: Droplets, label: "Aquariums" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

/** Боковое меню — только от lg. Ниже занимало 256 из 375 px ширины экрана. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-6 lg:flex">
      <div className="mb-8 text-xl font-bold tracking-tight text-sky-400">
        aquaDaddy Admin
      </div>

      <nav className="flex-1 space-y-1" aria-label="Admin navigation">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-150",
                active
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors duration-150 hover:bg-red-950/30 hover:text-red-400"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="font-medium">Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}

/**
 * Мобильная навигация админки: нижняя панель с иконкой и подписью на каждый
 * пункт (их 3 — в пределах лимита в 5) и тач-целью в 56 px по высоте.
 */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-center transition-colors duration-150",
                  active ? "text-sky-400" : "text-slate-400"
                )}
              >
                <item.icon size={20} aria-hidden="true" />
                <span className="text-[0.6875rem] font-semibold leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Link
            href="/"
            className="flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-center text-slate-400"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="text-[0.6875rem] font-semibold leading-none">
              Exit
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
