"use client";
import AquariumAddingForm from "@/components/component/aquariumAddingForm";
import Link from "next/link";
import React from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function AddNewTank() {
  const t = useTranslations("AquariumForm");
  return (
    <>
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold my-6 sm:my-10 font-bebas leading-none tracking-wide cursor-default inline-flex flex-wrap"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <span className="relative group transition-all duration-700 text-nowrap">
          <Link
            href={"/myTanks"}
            className="relative z-10 after:content-[''] after:absolute after:bottom-0 after:right-0 after:left-0 after:h-[3px] after:bg-current after:scale-x-0 after:origin-right after:transition-transform after:duration-500 group-hover:after:scale-x-100"
          >
            {t("aquariums-title")}
          </Link>
          <span className="text-nowrap"> &nbsp; | &nbsp;</span>
        </span>

        <span>{t("title")}</span>
      </motion.h2>

      <motion.h3
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-lg md:text-xl lg:text-2xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default "
      >
        {t("subtitle")}
      </motion.h3>
      <AquariumAddingForm />
    </>
  );
}
