import SignInForm from "@/components/component/signInForm";
import { generatePageMetadata } from "@/components/helpers/MetaTags";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  return generatePageMetadata("signIn", locale);
}

export default function SignIn() {
  // Apple-провайдер объявлен в auth.ts, но без ключей в окружении вход по нему
  // падает. Раньше кнопка «Sign in with Apple» просто не имела обработчика —
  // выглядела рабочей и не делала ничего. Показываем её только когда настроена.
  const appleEnabled = Boolean(
    process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET
  );

  return <SignInForm appleEnabled={appleEnabled} />;
}
