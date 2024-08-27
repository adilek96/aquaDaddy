import ForgotPasswordForm from "@/components/component/forgotPasswordForm";
import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ForgotPassword() {
  const t = await getTranslations("Sign");
  return (
    <>
      <ForgotPasswordForm />
      <div className="font-bold flex flex-row gap-1 mt-5">
        <p>{t("forgot-Message-bottom")}</p>
        <Link href={"signIn"} className="underline text-green-600">
          {t("signIn")}
        </Link>
      </div>
    </>
  );
}
