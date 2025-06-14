import SignInForm from "@/components/component/signInForm";
import React from "react";

export default async function SignIn({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <>
      <SignInForm locale={locale} />
    </>
  );
}
