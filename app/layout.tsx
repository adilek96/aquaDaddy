import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Libre_Franklin } from "next/font/google";
import { Header } from "@/components/component/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Bg } from "@/components/animations/bg";
import { ThemeProvider } from "next-themes";
import Settings from "@/components/component/settings";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";

const libre_franklin = Libre_Franklin({
  subsets: ["latin"],
  display: "swap",
});

const bebas = Tektur({
  weight: "400",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--font-bebas",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  variable: "--font-montserrat",
});

// Функция для генерации мета-данных
async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages({ locale });

  const meta = messages.Meta as any;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aquadaddy.app";

  return {
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
      type: meta.ogType,
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
      card: meta.twitterCard,
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
    other: {
      "application-name": "AquaDaddy",
      "apple-mobile-web-app-title": "AquaDaddy",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#000000",
      "msapplication-config": "/browserconfig.xml",
      "theme-color": "#000000",
    },
  };
}

export { generateMetadata };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages({ locale });

  return (
    <html suppressHydrationWarning className="scroll-smooth" lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-72x72.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${libre_franklin.className} ${bebas.variable} ${montserrat.variable}`}
      >
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <SessionProvider>
              <main className="flex relative  w-full h-full min-h-screen flex-col items-center justify-center bg-transparent bg-opacity-0 ">
                <Header />
                <div className="w-full h-full z-40 flex flex-col items-center justify-center ">
                  {children}
                </div>

                <div
                  className="w-[100vw] h-[100vh] fixed top-0 z-10 overflow-hidden   "
                  style={{ width: "100%", height: "100%" }}
                >
                  <Bg />
                </div>
                <Settings />
              </main>
            </SessionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
