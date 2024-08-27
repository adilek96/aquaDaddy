"use client";
import React from "react";
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
import { forgotPasswordAction } from "@/app/actions/forgotPasswordAction";
import Instruction from "./instruction";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function ForgotPasswordForm() {
  const [formState, formAction] = useFormState(
    forgotPasswordAction,
    INITIAL_STATE
  );
  const t = useTranslations("Sign");

  return (
    <Card className="w-full max-w-md mx-auto bg-[00EBFF]  backdrop-blur-md border border-muted z-40 mt-20">
      {formState.data === "ok" ? (
        <>
          <Instruction />
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>{t("forgot")}</CardTitle>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email-placeholder")}
                  required
                />
                <ZodErrors error={formState?.zodErrors?.email} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <SubmitButton
                className="w-full"
                text={t("forgot")}
                loadingText="Loading"
              />
              <StrapiErrors error={formState?.strapiErrors?.message} />
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}
