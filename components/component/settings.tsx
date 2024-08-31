"use client";
import React, { SVGProps } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslations } from "next-intl";
import ThemeToggle from "./themeToggle";
import AnimationToggle from "./animationToggle";
import { useSettingStore } from "@/store/modalsStore";
import { Button } from "../ui/button";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";

export default function Settings() {
  const { isOpen, setIsOpen } = useSettingStore();
  const t = useTranslations("Settings");
  return (
    <div
      className={`w-full h-full ${
        isOpen ? "flex" : "hidden"
      } justify-center items-center absolute top-0 left-0 z-40 backdrop-blur-md transition-all duration-700`}
    >
      <Card className="w-full min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  backdrop-blur-3xl border border-muted z-40 mt-20">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <br />
          <div className="flex  w-full justify-between items-center ">
            <CardDescription>{t("theme")}</CardDescription>
            <ThemeToggle />
          </div>
          <DropdownMenuSeparator />
          <div className="flex  w-full justify-between items-center ">
            <CardDescription>{t("animate")}</CardDescription>

            <AnimationToggle />
          </div>
        </CardHeader>
        <Button
          onClick={setIsOpen}
          className="absolute top-3 right-2 hover:bg-red-300"
          variant="ghost"
          size="icon"
        >
          <Close />
          <span className="sr-only">Close</span>
        </Button>
      </Card>
    </div>
  );
}

function Close(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="27"
      height="27"
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
        d="M6 18 17.94 6M18 18 6.06 6"
      />
    </svg>
  );
}
