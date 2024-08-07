import type { Metadata } from "next";
import { Tektur } from "next/font/google";
import { Montserrat } from "next/font/google";
import "../globals.css";
import { Libre_Franklin } from "next/font/google";
import { Header } from "@/components/component/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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
  title: "Create Next App",
  description: "Generated by create next app",
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
        className={`${libre_franklin.className} ${bebas.variable} ${montserrat.className}  `}
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}