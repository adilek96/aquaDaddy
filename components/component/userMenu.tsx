"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { SVGProps, useEffect } from "react";
import LogOutButton from "../ui/logOutButton";
import SettingsWrapper from "./settingsWrapper";
import { UserIcon } from "@/public/user";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
      // Отправляем событие при установке значения по умолчанию
      window.dispatchEvent(
        new CustomEvent("temperatureScaleChanged", { detail: "c" })
      );
    }
  }, []);

  if (!session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[00EBFF]  backdrop-blur-3xl "
          >
            <Avatar className="h-8 w-8 rounded-full flex justify-center items-center">
              <UserIcon />
            </Avatar>

            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <div className="backdrop-blur-3xl ">
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="bg-secondary/40"
          >
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SettingsWrapper />
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link
                href={`/signIn`}
                className="flex items-center gap-2 w-full"
                prefetch={false}
              >
                <SignIn className="w-4 h-4" />
                <span>{t("signIn")}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    );
  } else {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[00EBFF]  backdrop-blur-3xl "
          >
            <Avatar className="h-8 w-8 flex justify-center items-center">
              {session.user.image !== undefined ||
              session.user.image !== null ? (
                <Image
                  src={
                    avatarError ? "/app-logo.svg" : String(session.user.image)
                  }
                  alt="Profile picture"
                  fill={true}
                  sizes="32px"
                  priority
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <UserIcon />
              )}
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <div className=" backdrop-blur-3xl ">
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="bg-secondary/40"
          >
            <div className="flex items-center gap-2 p-2 cursor-default ">
              <Avatar className="h-8 w-8 rounded-full">
                {session.user.image !== undefined ||
                session.user.image !== null ? (
                  <Image
                    src={
                      avatarError ? "/app-logo.svg" : String(session.user.image)
                    }
                    alt="Profile picture"
                    fill={true}
                    sizes="32px"
                    priority
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <UserIcon />
                )}
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 leading-none">
                <div className="font-semibold">{session.user.name}</div>
                <div className="text-sm ">{session.user.email}</div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={`/profile`}
                className="flex items-center gap-2 w-full"
                prefetch={false}
              >
                <Profile className="h-4 w-4" />
                <span>{t("profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsWrapper />
            </DropdownMenuItem>

            <DropdownMenuItem>
              <LogOutButton text={t("logout")} />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    );
  }
}

function SignIn(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
      />
    </svg>
  );
}

function Profile(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
      />
    </svg>
  );
}
