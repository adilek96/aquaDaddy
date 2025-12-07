"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AquariumLists from "@/components/component/aquariumLists";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { FiPlus } from "react-icons/fi";

export default function MyTanks() {
  const t = useTranslations("MyTanks");
  const tHome = useTranslations("HomePage");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-bebas">
            {t("title")}
          </h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-0"
          >
            <Link href={"myTanks/addNewTank"}>
              <Button 
                className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                aria-label={tHome("addNewAquarium")}
              >
                <FiPlus className="w-5 h-5" />
                <span className="hidden sm:inline">{tHome("addNewAquarium")}</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </motion.div>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          {t("subtitle")}
        </p>
        <AquariumLists />
      </motion.div>
    </div>
  );
}
