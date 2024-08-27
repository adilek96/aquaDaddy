"use client";
import React from "react";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Instruction() {
  const t = useTranslations("Instruction");
  return (
    <>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <br />
        <CardDescription>{t("message")}</CardDescription>
        <CardDescription>{t("message-helper")}</CardDescription>
        <br />
        <Link className="flex justify-center items-center" href="/">
          <Button>{t("button")}</Button>
        </Link>
      </CardHeader>
    </>
  );
}
