import AquariumAddingForm from "@/components/component/aquariumAddingForm";
import Link from "next/link";
import React from "react";
import { getTranslations } from "next-intl/server";

export default async function AddNewTank() {
  const t = await getTranslations("AquariumForm");
  return (
    <>
      <h2 className="text-3xl md:text-4xl  font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default inline-flex flex-wrap ">
        <span className="relative group transition-all duration-700 text-nowrap">
          <Link
            href={"../myTanks"}
            className="relative z-10 after:content-[''] after:absolute after:bottom-0 after:right-0 after:left-0 after:h-[3px] after:bg-current after:scale-x-0 after:origin-right after:transition-transform after:duration-500 group-hover:after:scale-x-100"
          >
            {t("aquariums-title")}
          </Link>
        </span>

        <span className="text-nowrap"> &nbsp; | &nbsp;</span>
        <span>{t("title")}</span>
      </h2>

      <h3 className="text-lg md:text-xl lg:text-2xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default ">
        {t("subtitle")}
      </h3>
      <AquariumAddingForm />
    </>
  );
}
