"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, User as UserIconLucide, UserCircle2 } from "lucide-react";
import LogOutButton from "../ui/logOutButton";
import SettingsWrapper from "./settingsWrapper";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export function UserMenu() {
  const t = useTranslations("Header");
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const measurementSystem = localStorage.getItem("measurement_system");
    if (measurementSystem === null) {
      localStorage.setItem("measurement_system", "metric");
    }
    const tempSystem = localStorage.getItem("temperature_scales");
    if (tempSystem === null) {
      localStorage.setItem("temperature_scales", "c");
      window.dispatchEvent(
        new CustomEvent("temperatureScaleChanged", { detail: "c" })
      );
    }
  }, []);

  const user = session?.user;
  // Условие было `image !== undefined || image !== null` — оно истинно всегда,
  // поэтому при пустом аватаре в <Image src> уезжала строка "null" и картинка
  // грузилась с ошибкой, а потом подменялась через onError
  const avatarUrl = !avatarError && user?.image ? user.image : null;
  // Инициалы вместо захардкоженного «JD»
  const initials =
    user?.name?.trim().charAt(0).toUpperCase() ||
    user?.email?.trim().charAt(0).toUpperCase() ||
    "?";

  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={user ? (user.name ?? t("profile")) : t("signIn")}
      >
        <Avatar className="h-8 w-8">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt=""
              onError={() => setAvatarError(true)}
            />
          ) : null}
          <AvatarFallback className="text-xs font-bold">
            {user ? initials : <UserIconLucide className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
  );

  if (!user) {
    return (
      <DropdownMenu>
        {trigger}
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[12rem]">
          <DropdownMenuItem asChild>
            <Link href="/signIn" className="flex w-full items-center gap-2.5">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{t("signIn")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SettingsWrapper />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[14rem]">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar className="h-9 w-9">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt=""
                onError={() => setAvatarError(true)}
              />
            ) : null}
            <AvatarFallback className="text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 gap-0.5 leading-tight">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex w-full items-center gap-2.5">
            <UserCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <SettingsWrapper />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Выход отделён от остальных пунктов — деструктивное действие
            не должно стоять вплотную к обычной навигации */}
        <DropdownMenuItem asChild>
          <LogOutButton text={t("logout")} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
