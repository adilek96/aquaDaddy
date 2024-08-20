import { MainPage } from "@/components/component/main-page";

export default function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="z-40">
      <MainPage locale={locale} />
    </div>
  );
}
