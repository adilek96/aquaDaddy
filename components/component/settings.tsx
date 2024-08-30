"use client";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslations } from "next-intl";
import ThemeToggle from "./themeToggle";
import AnimationToggle from "./animationToggle";

export default function Settings() {
  const t = useTranslations("Settings");
  return (
    <>
      <Card className="w-full min-w-[300px] max-w-md mx-auto bg-[00EBFF]  backdrop-blur-md border border-muted z-40 mt-20">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <br />
          <div className="flex  w-full justify-between items-center ">
            <CardDescription>{t("theme")}</CardDescription>
            <ThemeToggle />
          </div>
          <br />
          <div className="flex  w-full justify-between items-center ">
            <CardDescription>{t("animate")}</CardDescription>
            <AnimationToggle />
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
