import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/component/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { ToastProvider } from "@/components/ui/toast";
import GlobalModals from "@/components/component/globalModals";
import Settings from "@/components/component/settings";

/**
 * Раньше подключались три семейства Google Fonts (Libre Franklin, Tektur,
 * Montserrat) — три отдельных запроса за шрифтами на первой отрисовке.
 * Manrope переменный, покрывает latin + latin-ext + cyrillic (нужен для ru/az)
 * и закрывает и заголовки, и текст одним файлом.
 */
const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Зум не запрещаем — это требование доступности
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0F9FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1721" },
  ],
};

async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages({ locale });

  const meta = messages.Meta as any;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aquadaddy.app";

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: meta.author }],
    creator: meta.author,
    publisher: meta.author,
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
      url: baseUrl,
      title: meta.ogTitle,
      description: meta.ogDescription,
      siteName: "AquaDaddy",
      images: [
        {
          url: `${baseUrl}${meta.ogImage}`,
          width: 1200,
          height: 630,
          alt: meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: meta.twitterTitle,
      description: meta.twitterDescription,
      images: [`${baseUrl}${meta.twitterImage}`],
      creator: "@aquadaddy",
      site: "@aquadaddy",
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        az: `${baseUrl}/az`,
      },
    },
    category: "Aquarium Management",
    classification: "Aquarium Software",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      ],
      apple: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      ],
    },
    manifest: "/manifest.json",
    other: {
      "application-name": "AquaDaddy",
      "apple-mobile-web-app-title": "AquaDaddy",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "mobile-web-app-capable": "yes",
      "msapplication-config": "/browserconfig.xml",
      "format-detection": "telephone=no",
    },
  };
}

export { generateMetadata };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages({ locale });

  return (
    <html
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      lang={locale}
      className={manrope.variable}
    >
      <body className="app-backdrop min-h-dvh tap-fast">
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <SessionProvider>
              <ToastProvider>
                <a href="#main-content" className="skip-link">
                  Skip to content
                </a>

                <div className="relative flex min-h-dvh w-full flex-col">
                  <Header />

                  {/* Фон — статичный CSS-градиент на body (.app-backdrop):
                      никаких лишних DOM-узлов и канваса поверх контента */}
                  <main
                    id="main-content"
                    className="app-page relative z-raised w-full flex-1"
                  >
                    {children}
                  </main>
                </div>

                <Settings />
                <GlobalModals />
              </ToastProvider>
            </SessionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
