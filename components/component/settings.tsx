"use client";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import ThemeToggle from "./themeToggle";
import AnimationToggle from "./animationToggle";
import { useSettingStore } from "@/store/modalsStore";
import { Button } from "../ui/button";
import MeasurementToggle from "./measurementToggle";
import TempToggle from "./tempToggle";
import { useModalDismiss } from "@/lib/useModalDismiss";

export default function Settings() {
  const { isOpen, setIsOpen } = useSettingStore();
  const t = useTranslations("Settings");

  // setIsOpen — переключатель, при открытом окне он его закрывает
  useModalDismiss(isOpen, setIsOpen);
  return (
    <div
      className={`fixed inset-0 z-modal overflow-y-auto overscroll-contain bg-scrim/60 p-4 backdrop-blur-sm ${
        isOpen ? "flex" : "hidden"
      } items-start justify-center sm:items-center`}
      // Клик по подложке закрывает окно — раньше выйти можно было
      // только крестиком в углу
      onClick={setIsOpen}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
        className="surface-panel-raised relative my-auto w-full max-w-md animate-scale-in p-5 sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id="settings-title" className="text-xl sm:text-2xl">
            {t("title")}
          </h2>
          <Button
            onClick={setIsOpen}
            variant="ghost"
            size="icon-sm"
            aria-label={t("title")}
            className="-mr-1 -mt-1 shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Каждая настройка — строка «подпись / управление» с разделителями
            между строками, а не подряд идущие CardDescription в CardHeader */}
        <dl className="divide-y divide-border">
          {[
            { label: t("theme"), control: <ThemeToggle /> },
            { label: t("animate"), control: <AnimationToggle /> },
            { label: t("measurement"), control: <MeasurementToggle /> },
            { label: t("temp"), control: <TempToggle /> },
          ].map(({ label, control }) => (
            <div
              key={label}
              className="flex min-h-[56px] items-center justify-between gap-4 py-1"
            >
              <dt className="text-sm font-medium">{label}</dt>
              <dd className="shrink-0">{control}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
