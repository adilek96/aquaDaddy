import CardFilling from "@/components/component/cardFilling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookIcon, FishIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";

export default async function Wiki({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("HomePage");

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
