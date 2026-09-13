"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AquariumLists from "@/components/component/aquariumLists";
import { useTranslations } from "next-intl";

export default function MyTanks() {
  const t = useTranslations("MyTanks");
  const tHome = useTranslations("HomePage");

  return (
    <div className="app-container py-6 sm:py-10">
      {/* Шапка страницы: на телефоне заголовок и кнопка идут в столбик,
          от sm — в строку. Анимация входа отдана CSS вместо motion,
          чтобы не тащить рантайм анимаций ради одного fade-in */}
      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1">{t("title")}</h1>
            <p className="measure text-sm text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>
          </div>

          <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
            <Link href="/myTanks/addNewTank">
              <Plus className="h-5 w-5" aria-hidden="true" />
              {tHome("addNewAquarium")}
            </Link>
          </Button>
        </div>
      </header>

      <AquariumLists />
    </div>
  );
}
