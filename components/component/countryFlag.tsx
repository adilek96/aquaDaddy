"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Флаг страны по коду ISO alpha-2 с подписью-кодом рядом.
 * Используется в профиле, в деталях и на карточках публичных аквариумов —
 * страна показывается «по коду и флагу», так же как в мобильном приложении.
 */
export default function CountryFlag({
  code,
  showCode = true,
  size = 16,
  className,
  codeClassName,
}: {
  code?: string | null;
  showCode?: boolean;
  size?: number;
  className?: string;
  codeClassName?: string;
}) {
  const [error, setError] = useState(false);

  if (!code) return null;
  const upper = code.toUpperCase();

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {!error && (
        <Image
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt={`Flag of ${upper}`}
          width={Math.round((size * 4) / 3)}
          height={size}
          className="shrink-0 rounded-[2px] object-cover"
          onError={() => setError(true)}
        />
      )}
      {showCode && (
        <span className={cn("text-sm font-semibold text-muted-foreground", codeClassName)}>
          {upper}
        </span>
      )}
    </span>
  );
}
