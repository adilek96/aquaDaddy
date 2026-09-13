"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "az", label: "Azərbaycan" },
] as const;

export default function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();

  const setLang = (lang: string) => {
    // max-age: без него кука сессионная и язык сбрасывается при перезапуске
    // браузера; SameSite=Lax — чтобы не уезжала в сторонние запросы
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="gap-1.5 px-2 sm:w-auto"
          aria-label={`Language: ${current.label}`}
        >
          <Globe className="h-5 w-5" aria-hidden="true" />
          {/* Раньше в списке у всех трёх языков была одна и та же безликая
              иконка флага, а текущий язык нигде не отмечался */}
          <span className="hidden text-xs font-bold uppercase sm:inline">
            {current.code}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[11rem]">
        {LANGUAGES.map(({ code, label }) => {
          const active = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLang(code)}
              className={cn("justify-between gap-3", active && "font-semibold")}
            >
              <span className="flex items-center gap-2.5">
                <span className="w-6 text-xs font-bold uppercase text-muted-foreground">
                  {code}
                </span>
                {label}
              </span>
              {active && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
