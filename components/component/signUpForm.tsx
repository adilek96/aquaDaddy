"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpAction } from "@/app/actions/signUpAction";
import { useFormState } from "react-dom";
import { ZodErrors } from "../helpers/ZodErrors";
import { StrapiErrors } from "../helpers/StrapiErrors";
import { SubmitButton } from "../ui/submitButton";
import { useTranslations } from "next-intl";
import Instruction from "./instruction";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function SignUpForm() {
  const [formState, formAction] = useFormState(signUpAction, INITIAL_STATE);
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
            <CardTitle>{t("signUp")}</CardTitle>
            <CardDescription>{t("signUp-Message")}</CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={t("username-placeholder")}
                  required
                />
                <ZodErrors error={formState?.zodErrors?.username} />
              </div>
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
            </CardContent>

            <CardFooter className="flex flex-col">
              <SubmitButton
                className="w-full"
                text={t("signUp")}
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
