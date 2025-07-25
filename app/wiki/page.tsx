import CardFilling from "@/components/component/cardFilling";
import { Card } from "@/components/ui/card";
import { BookIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { generateWikiMetadata } from "@/components/helpers/MetaTags";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  return generateWikiMetadata(locale);
}

export default function Wiki() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex justify-center items-center h-[100vh] w-[100vw]  ">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 grid-flow-row-dense md:grid-cols-3 gap-8 p-4 sm:p-6 md:p-8  ">
          <Card className="bg-[#00EBFF]/5 dark:bg-black/50  dark:hover:bg-green-700/70  backdrop-blur-md text-secondary-foreground hover:bg-green-300/50  transition-all duration-300   hover:text-secondary-foregroundcol-span-1 sm:col-span-1 md:col-span-3  border border-muted   hover:-translate-y-1   ">
            <CardFilling
              title={t("wiki-title")}
              description={t("wiki-description")}
              icon={<BookIcon className="h-6 w-6" />}
              link={`#`}
              count={250}
              linkText={t("wiki-link")}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
