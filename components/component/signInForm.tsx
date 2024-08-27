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
import { StrapiErrors } from "../helpers/StrapiErrors";
import { SubmitButton } from "../ui/submitButton";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import { signInAction } from "@/app/actions/signInAction";
import { ZodErrors } from "../helpers/ZodErrors";
import Link from "next/link";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  strapiErrors: null,
  message: null,
};

export default function SignInForm({ locale }: { locale: string }) {
  const [formState, formAction] = useFormState(signInAction, INITIAL_STATE);
  const t = useTranslations("Sign");
  console.log(formState);

  return (
    <Card className="w-full max-w-md mx-auto bg-[00EBFF]  backdrop-blur-md border border-muted z-40 mt-20">
      <CardHeader>
        <CardTitle>{t("signIn")}</CardTitle>
        <CardDescription>{t("signIn-Message")}</CardDescription>
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
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex justify-end w-full mb-3">
            <Link
              className="hover:text-blue-400"
              href={`/${locale}/forgot-password`}
            >
              Forgot password
            </Link>
          </div>
          <SubmitButton
            className="w-full"
            text={t("signIn")}
            loadingText="Loading"
          />
          <StrapiErrors error={formState?.strapiErrors?.message} />
        </CardFooter>
      </form>
    </Card>
  );
}
