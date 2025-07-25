import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generatePageMetadata(
  pageKey: string,
  locale: string = "en"
): Promise<Metadata> {
  const t = await getTranslations("Meta");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aquadaddy.app";

  // Базовые мета-данные
  const baseMetadata: Metadata = {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: t("author") }],
    creator: t("author"),
    publisher: t("author"),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website" as const,
      locale: locale,
      url: `${baseUrl}/${pageKey}`,
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "AquaDaddy",
      images: [
        {
          url: `${baseUrl}${t("ogImage")}`,
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${baseUrl}${t("twitterImage")}`],
      creator: "@aquadaddy",
      site: "@aquadaddy",
    },
    alternates: {
      canonical: `${baseUrl}/${pageKey}`,
      languages: {
        "en": `${baseUrl}/en/${pageKey}`,
        "ru": `${baseUrl}/ru/${pageKey}`,
        "az": `${baseUrl}/az/${pageKey}`,
      },
    },
  };

  return baseMetadata;
}

// Специфичные мета-данные для разных страниц
export async function generateAquariumMetadata(
  aquariumName: string,
  locale: string = "en"
): Promise<Metadata> {
  const t = await getTranslations("Meta");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aquadaddy.app";

  return {
    title: `${aquariumName} - AquaDaddy`,
    description: `View and manage your ${aquariumName} aquarium. Track water parameters, inhabitants, and maintenance schedule.`,
    openGraph: {
      title: `${aquariumName} - AquaDaddy`,
      description: `View and manage your ${aquariumName} aquarium. Track water parameters, inhabitants, and maintenance schedule.`,
      type: "website" as const,
      locale: locale,
      url: `${baseUrl}/myTanks/${aquariumName}`,
      siteName: "AquaDaddy",
      images: [
        {
          url: `${baseUrl}${t("ogImage")}`,
          width: 1200,
          height: 630,
          alt: `${aquariumName} - AquaDaddy`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${aquariumName} - AquaDaddy`,
      description: `View and manage your ${aquariumName} aquarium. Track water parameters, inhabitants, and maintenance schedule.`,
      images: [`${baseUrl}${t("twitterImage")}`],
    },
  };
}

export async function generateWikiMetadata(
  locale: string = "en"
): Promise<Metadata> {
  const t = await getTranslations("Meta");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aquadaddy.app";

  return {
    title: "Aquarium Encyclopedia - AquaDaddy",
    description: "Explore our comprehensive aquarium encyclopedia. Learn about fish species, plants, equipment, and aquarium care.",
    openGraph: {
      title: "Aquarium Encyclopedia - AquaDaddy",
      description: "Explore our comprehensive aquarium encyclopedia. Learn about fish species, plants, equipment, and aquarium care.",
      type: "website" as const,
      locale: locale,
      url: `${baseUrl}/wiki`,
      siteName: "AquaDaddy",
      images: [
        {
          url: `${baseUrl}${t("ogImage")}`,
          width: 1200,
          height: 630,
          alt: "Aquarium Encyclopedia - AquaDaddy",
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: "Aquarium Encyclopedia - AquaDaddy",
      description: "Explore our comprehensive aquarium encyclopedia. Learn about fish species, plants, equipment, and aquarium care.",
      images: [`${baseUrl}${t("twitterImage")}`],
    },
  };
} 