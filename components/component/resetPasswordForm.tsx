"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ZodErrors } from "../helpers/ZodErrors";
import { SubmitButton } from "../ui/submitButton";
import { StrapiErrors } from "../helpers/StrapiErrors";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import { resetPasswordAction } from "@/app/actions/resetPasswordAction";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function ResetPasswordForm() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const resetCode = searchParams.get("code");
      setCode(resetCode);
    }
  }, []);

  const [formState, formAction] = useFormState(
    resetPasswordAction,
    INITIAL_STATE
  );

  const t = useTranslations("Sign");

  return (
    <Card className="w-full max-w-md mx-auto bg-[00EBFF]  backdrop-blur-md border border-muted z-40 mt-20">
      <CardHeader>
        <CardTitle>{t("reset")}</CardTitle>
        <CardDescription>{t("reset-Message")}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("password-placeholder")}
              required
            />
            <ZodErrors error={formState?.zodErrors?.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repeatPassword">{t("repeat-password")}</Label>
            <Input
              id="repeatPassword"
              name="repeatPassword"
              type="password"
              placeholder={t("repeat-password-placeholder")}
              required
            />
            <ZodErrors error={formState?.zodErrors?.repeatPassword} />
          </div>

          <Input
            className="invisible hidden"
            id="code"
            name="code"
            type="string"
            value={code || "code"}
            readOnly
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col">
          <SubmitButton
            className="w-full"
            text={t("reset")}
            loadingText="Loading"
          />
          <StrapiErrors error={formState?.strapiErrors?.message} />
        </CardFooter>
      </form>
    </Card>
  );
}
