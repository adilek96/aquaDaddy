"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon } from "@/public/globe";

export default function LanguageToggle() {
  const router = useRouter();

  const setLang = (lang: string) => {
    document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-md ">
            <GlobeIcon className="w-5 h-5 text-muted-foreground" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <div className=" backdrop-blur-3xl ">
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="bg-secondary/40"
          >
            <DropdownMenuItem onClick={() => setLang("en")}>
              <FlagIcon className="w-5 h-5" />
              <span>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("ru")}>
              <FlagIcon className="w-5 h-5" />
              <span>Russian</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("az")}>
              <FlagIcon className="w-5 h-5" />
              <span>Azerbaijan</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}

function FlagIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
