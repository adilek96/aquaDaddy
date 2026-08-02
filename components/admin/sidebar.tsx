"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Droplets, Image, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/aquariums", icon: Droplets, label: "Aquariums" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6 flex flex-col h-full">
      <div className="mb-8 font-bold text-xl tracking-tight text-blue-400">
        aquaDaddy Admin
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}
