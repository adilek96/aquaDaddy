"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Save, X, Fish, Globe2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchAquariumCount } from "@/app/actions/aquariumCountFetch";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("Profile");
  const tHome = useTranslations("HomePage");
  const [aquariumCount, setAquariumCount] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", bio: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/signIn");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    setFormData({ name: session.user.name || "", bio: "" });
    if (session.user.id) fetchAquariumCount(session.user.id).then(setAquariumCount);
  }, [session]);

  // Скелетон вместо блока «Loading...» на пол-экрана: страница не прыгает,
  // когда сессия наконец подтянулась
  if (status === "loading") {
    return (
      <div className="app-container max-w-3xl py-6 sm:py-10">
        <div className="surface-panel p-6 sm:p-8" aria-busy="true">
          <div className="mb-6 flex items-center gap-4">
            <div className="skeleton h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-56" />
            </div>
          </div>
          <div className="skeleton mb-4 h-24 w-full" />
          <div className="skeleton h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const handleSave = async () => {
    // TODO: сохранение профиля на сервере пока не реализовано
    setIsEditing(false);
  };

  const country = (session.user as any).country as string | undefined;

  return (
    <div className="app-container max-w-3xl py-6 sm:py-10">
      <div className="surface-panel-raised animate-fade-in-up overflow-hidden">
        {/* Тонкая цветная полоса вместо баннера на 230px */}
        <div
          aria-hidden="true"
          className="h-24 bg-gradient-to-r from-primary via-secondary to-accent sm:h-28"
        />

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          {/* Аватар заходит на полосу — компактно и на телефоне, и на десктопе */}
          <div className="-mt-12 mb-6 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-raised sm:h-28 sm:w-28">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback className="text-2xl font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl">{session.user.name}</h1>
                <p className="truncate text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </div>

            <Button
              variant={isEditing ? "ghost" : "outline"}
              onClick={() => setIsEditing((v) => !v)}
              className="shrink-0"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" aria-hidden="true" />
                  {t("cancel")}
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {t("edit")}
                </>
              )}
            </Button>
          </div>

          {/* Показатели: две реальные метрики вместо трёх, две из которых
              были заглушками «0» и «N/A» */}
          <dl className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-surface-border bg-background/50 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Fish className="h-4 w-4 text-primary" aria-hidden="true" />
                {tHome("statAquariums")}
              </dt>
              <dd data-numeric className="mt-1 font-display text-2xl font-extrabold">
                {aquariumCount === null ? (
                  <span className="skeleton inline-block h-7 w-10 align-middle" />
                ) : (
                  aquariumCount
                )}
              </dd>
            </div>

            <div className="rounded-xl border border-surface-border bg-background/50 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe2 className="h-4 w-4 text-secondary" aria-hidden="true" />
                {t("country")}
              </dt>
              <dd className="mt-1 truncate font-display text-2xl font-extrabold">
                {country || "—"}
              </dd>
            </div>
          </dl>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t("username")}</Label>
              {isEditing ? (
                <Input
                  id="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              ) : (
                <p className="rounded-lg border border-surface-border bg-muted/40 px-3.5 py-2.5 text-sm">
                  {session.user.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              {/* Почта приходит от провайдера входа и не редактируется —
                  показываем как read-only текст, а не как отключённое поле */}
              <p className="rounded-lg border border-surface-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                {session.user.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder={t("bioPlaceholder")}
                  rows={4}
                />
              ) : (
                <p className="min-h-[88px] rounded-lg border border-surface-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                  {formData.bio || t("bioPlaceholder")}
                </p>
              )}
            </div>

            {isEditing && (
              <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
                <Save className="h-4 w-4" aria-hidden="true" />
                {t("button")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
