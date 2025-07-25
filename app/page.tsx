import { MainPage } from "@/components/component/main-page";
import { generatePageMetadata } from "@/components/helpers/MetaTags";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  return generatePageMetadata("", locale);
}

export default function Home() {
  return (
    <div className="z-40">
      <MainPage />
    </div>
  );
}
