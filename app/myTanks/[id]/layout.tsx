import { generateAquariumMetadata } from "@/components/helpers/MetaTags";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import { cookies } from "next/headers";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  
  try {
    // Получаем данные аквариума для мета-тегов
    const aquarium = await fetchUserAquarium({ tankId: params.id });
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
  return children;
} 