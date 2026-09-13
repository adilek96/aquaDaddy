"use client";
import AquariumAddingForm from "@/components/component/aquariumAddingForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AddNewTank() {
  const t = useTranslations("AquariumForm");

  return (
    <div className="app-container py-6 sm:py-10">
      {/* Раньше шапка была одной строкой «Мои аквариумы | Новый аквариум»
          внутри анимированного h2: на телефоне она переносилась посреди
          разделителя и читалась как один заголовок. Теперь это обычные
          хлебные крошки над h1 */}
      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <nav aria-label="Breadcrumb" className="mb-2">
          <Link
            href="/myTanks"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors duration-fast hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("aquariums-title")}
          </Link>
        </nav>

        <h1 className="mb-2">{t("title")}</h1>
        <p className="measure text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <AquariumAddingForm />
    </div>
  );
}
