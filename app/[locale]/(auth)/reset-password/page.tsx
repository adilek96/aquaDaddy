import ResetPasswordForm from "@/components/component/resetPasswordForm";
import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ResetPassword() {
  const t = await getTranslations("Sign");

  return (
    <>
      <ResetPasswordForm />
    </>
  );
}
