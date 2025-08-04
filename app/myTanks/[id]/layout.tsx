import { generateAquariumMetadata } from "@/components/helpers/MetaTags";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import { cookies } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const { id } = await params;

  try {
    // Получаем данные аквариума для мета-тегов
    const aquarium = await fetchUserAquarium({ tankId: id });
    const aquariumName = aquarium?.name || "Aquarium";

    return generateAquariumMetadata(aquariumName, locale);
  } catch (error) {
    // Если не удалось получить данные аквариума, используем базовые мета-данные
    return generateAquariumMetadata("Aquarium", locale);
  }
}

export default function AquariumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className=" w-full h-full   mx-auto">{children}</div>;
}
