import TankCard from "@/components/component/tankCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { SVGProps } from "react";
import { Suspense } from "react";
import AquariumLists from "@/components/component/aquariumLists";

export default async function MyTanks() {
  const t = await getTranslations("MyTanks");
  // TODO: fetch aquariums from DB

  // TODO: implement search and sort state (client component)

  return (
    <>
      <div className="flex no-wrap justify-between items-center">
        <h2 className="text-3xl md:text-4xl  font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default inline-flex flex-wrap ">
          {t("title")}
        </h2>

        <Link href={"myTanks/addNewTank"}>
          <Button variant={"ghost"} className="mr-5 bg-red-500">
            +
          </Button>
        </Link>
      </div>
      <h3 className="text-lg md:text-xl lg:text-2xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default ">
        {t("subtitle")}
      </h3>
      <AquariumLists />
    </>
  );
}
