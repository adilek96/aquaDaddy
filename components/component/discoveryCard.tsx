"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Star, MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface DiscoveryCardProps {
  aquarium: any;
}

export default function DiscoveryCard({ aquarium }: DiscoveryCardProps) {
  const t = useTranslations("Discovery");
  const [imgError, setImgError] = useState(false);

  const hasPhoto = Boolean(aquarium.images?.length) && !imgError;
  const imageUrl = aquarium.images?.[0]?.url || "/app-logo.svg";
  const averageRating = aquarium.averageRating || 0;
  const ratingsCount = aquarium._count?.ratings || 0;
  const commentsCount = aquarium._count?.comments || 0;

  return (
    <Link
      href={`/discovery/${aquarium.id}`}
      className="surface-panel surface-interactive group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={imgError ? "/app-logo.svg" : imageUrl}
          alt={aquarium.name}
          fill
          // sizes отсутствовал: браузер запрашивал картинку под всю ширину
          // вьюпорта даже для карточки в четыре колонки
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={cn(
            "transition-transform duration-slow ease-out-soft group-hover:scale-[1.04]",
            hasPhoto ? "object-cover" : "object-contain p-8 opacity-60"
          )}
          onError={() => setImgError(true)}
        />
        <span className="absolute right-2 top-2 rounded-full border border-white/20 bg-scrim/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {t(`aquariumType.${aquarium.type.toLowerCase()}` as any)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* line-clamp вместо прежнего min-h-[56px]: заголовок в одну строку
            больше не оставляет пустой полосы под собой */}
        <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug sm:text-lg">
          {aquarium.name}
        </h3>

        {aquarium.description && (
          <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
            {aquarium.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Star
                className={cn(
                  "h-4 w-4",
                  averageRating > 0
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span data-numeric className="font-bold">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              {ratingsCount > 0 && (
                <span className="text-muted-foreground" data-numeric>
                  ({ratingsCount})
                </span>
              )}
              <span className="sr-only">{t("ratings")}</span>
            </span>

            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span data-numeric>{commentsCount}</span>
              <span className="sr-only">{t("comments")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 border-t border-surface-border pt-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={aquarium.user?.image || ""} alt="" />
              <AvatarFallback>
                <User className="h-3 w-3" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-muted-foreground">
              {aquarium.user?.name || "Anonymous"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
