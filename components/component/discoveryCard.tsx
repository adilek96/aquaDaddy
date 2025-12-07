"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiStar, FiMessageCircle, FiUser } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface DiscoveryCardProps {
  aquarium: any;
}

export default function DiscoveryCard({ aquarium }: DiscoveryCardProps) {
  const t = useTranslations("Discovery");
  const [imgError, setImgError] = useState(false);

  const imageUrl = aquarium.images?.[0]?.url || "/app-logo.svg";
  const averageRating = aquarium.averageRating || 0;
  const ratingsCount = aquarium._count?.ratings || 0;
  const commentsCount = aquarium._count?.comments || 0;

  return (
    <Link href={`/discovery/${aquarium.id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-muted overflow-hidden h-[380px] flex flex-col">
        {/* Изображение */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imgError ? "/app-logo.svg" : imageUrl}
            alt={aquarium.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
          {/* Тип аквариума */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
            {t(`aquariumType.${aquarium.type.toLowerCase()}`)}
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Название */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[56px]">
            {aquarium.name}
          </h3>

          {/* Описание */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
            {aquarium.description || "No description"}
          </p>

          {/* Рейтинг и комментарии */}
          <div className="flex items-center gap-4 mb-3 text-sm mt-auto">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              {ratingsCount > 0 && (
                <span className="text-muted-foreground">({ratingsCount})</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <FiMessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </div>
          </div>

          {/* Автор */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Avatar className="w-6 h-6">
              <AvatarImage src={aquarium.user.image || ""} />
              <AvatarFallback>
                <FiUser className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {aquarium.user.name || "Anonymous"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
