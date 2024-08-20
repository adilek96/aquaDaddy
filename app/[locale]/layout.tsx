import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import { Montserrat } from "next/font/google";
import "../globals.css";
import { Libre_Franklin } from "next/font/google";
import { Header } from "@/components/component/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Bg } from "@/components/animations/bg";

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
});

export const metadata: Metadata = {
  title: "AquaDaddy",
  description: "All about aquariumistics",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${libre_franklin.className} ${bebas.variable} ${montserrat.className}   `}
      >
        <NextIntlClientProvider messages={messages}>
          <main className="flex relative  w-full h-full min-h-screen flex-col items-center justify-center bg-transparent bg-opacity-0 ">
            <Header locale={locale} />
            <div className="w-full h-full z-40 flex flex-col items-center justify-center">
              {children}
            </div>

            <div
              className="w-[100vw] h-[100vh] fixed top-0 z-10 overflow-hidden  "
              style={{ width: "100%", height: "100%" }}
            >
              <Bg />
            </div>
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
