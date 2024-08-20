import SignInForm from "@/components/component/signInForm";
import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function SignIn() {
  const t = await getTranslations("Sign");
  return (
    <>
      <SignInForm />
      <div className="font-bold flex flex-row gap-1 mt-5">
        <p>{t("signIn-Message-bottom")}</p>
        <Link href={"signUp"} className="underline text-green-600">
          {t("signUp")}
        </Link>
      </div>
    </>
  );
}
