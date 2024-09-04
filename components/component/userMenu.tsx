import { getUserMeLoader } from "@/app/services/get-user-me-loader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { SVGProps } from "react";
import LogOutButton from "../ui/logOutButton";
import { getTranslations } from "next-intl/server";
import SettingsWrapper from "./settingsWrapper";
import { UserIcon } from "@/public/user";
import { getStrapiURL } from "@/lib/utils";

export async function UserMenu({ locale }: { locale: string }) {
  const userPromise = await getUserMeLoader();
  const t = await getTranslations("Header");
  const url = new URL(userPromise.data.url, getStrapiURL());

  if (!userPromise.ok) {
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
        <DropdownMenuContent
          align="end"
          className="bg-secondary/40  backdrop-blur-3xl "
        >
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SettingsWrapper />
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href={`/${locale}/signIn`}
              className="flex items-center gap-2 w-full"
              prefetch={false}
            >
              <SignIn className="w-4 h-4" />
              <span>{t("signIn")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-[00EBFF]  backdrop-blur-3xl "
        >
          <Avatar className="h-8 w-8 flex justify-center items-center">
            <UserIcon />
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-secondary/40  backdrop-blur-3xl "
      >
        <div className="flex items-center gap-2 p-2 cursor-default">
          <Avatar className="h-8 w-8 rounded-full">
            {url !== undefined || url !== null ? (
              <AvatarImage src={String(url)} alt="Profile picture" />
            ) : (
              <UserIcon />
            )}
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 leading-none">
            <div className="font-semibold">{userPromise.data.username}</div>
            <div className="text-sm text-muted-foreground">
              {userPromise.data.email}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`/${locale}/profile`}
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
    </DropdownMenu>
  );
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
