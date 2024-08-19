import SignUpForm from "@/components/component/signUpForm";
import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function SignUp() {
  const t = await getTranslations("Sign");
  return (
    <>
      <SignUpForm />
      <div className="font-bold flex flex-row gap-1 my-5 ">
        <p>{t("signUp-Message-bottom")}</p>

        <Link href={"signIn"} className="underline text-green-600">
          {t("signIn")}
        </Link>
      </div>
    </>
  );
}
