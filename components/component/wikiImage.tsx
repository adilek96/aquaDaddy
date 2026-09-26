"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Обложка записи энциклопедии. Обычный <img>, а не next/image: оптимизатор
 * скачивает картинку сам, а контейнер сайта публичных имён не резолвит.
 * Часть картинок в вики уже недоступна — вместо битой иконки показываем заглушку.
 */
export default function WikiImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={cn("grid h-full w-full place-items-center bg-accent/10 text-accent", className)}
      >
        <BookOpen className="h-10 w-10 opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
