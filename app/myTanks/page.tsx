"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AquariumLists from "@/components/component/aquariumLists";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function MyTanks() {
  const t = useTranslations("MyTanks");

  return (
    <>
      <div className="flex no-wrap justify-between items-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold my-6 sm:my-10 font-bebas leading-none tracking-wide cursor-default inline-flex flex-wrap"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {t("title")}
        </motion.h2>

        <Link href={"myTanks/addNewTank"}>
          <Button variant={"ghost"} className="mr-5 bg-red-500 text-white">
            +
          </Button>
        </Link>
      </div>
      <motion.h3
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-lg md:text-xl lg:text-2xl font-bold my-10 ml-5 font-bebas  leading-none  tracking-wide   cursor-default "
      >
        {t("subtitle")}
      </motion.h3>
      <AquariumLists />
    </>
  );
}
