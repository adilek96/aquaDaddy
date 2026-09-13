"use client";
import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { useSettingStore } from "@/store/modalsStore";

/**
 * Пункт «Настройки» в выпадающем меню. forwardRef нужен, потому что
 * DropdownMenuItem рендерится через asChild и передаёт ref сюда.
 */
const SettingsWrapper = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function SettingsWrapper({ className, onClick, ...props }, ref) {
  const setIsOpen = useSettingStore((s) => s.setIsOpen);
  const t = useTranslations("Header");

  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        setIsOpen();
      }}
      className={`flex w-full items-center gap-2.5 ${className ?? ""}`}
      {...props}
    >
      <Settings className="h-4 w-4" aria-hidden="true" />
      <span>{t("settings")}</span>
    </button>
  );
});

export default SettingsWrapper;
