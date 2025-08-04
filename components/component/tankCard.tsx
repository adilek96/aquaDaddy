"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import Image from "next/image";

export default function TankCard({
  aquarium,
  notAssignedText,
}: {
  aquarium: any;
  notAssignedText?: string;
}) {
  const t = useTranslations("AquariumForm");
  const [nextServiceStyle, setNextServiceStyle] = useState(
    "bg-maintenance-default/30"
  );
  const [nextServiceDay, setNextServiceDay] = useState("notAssignedText");
  const image = aquarium.image || "/app-logo.svg";
  const [mainImgError, setMainImgError] = useState(false);
  const [defaultImgError, setDefaultImgError] = useState(false);

  // Получаем ближайшее PENDING обслуживание
  const getNextPendingMaintenance = () => {
    if (!aquarium.maintenance || aquarium.maintenance.length === 0) {
      return null;
    }

    // Фильтруем только PENDING записи и сортируем по дате
    const pendingMaintenance = aquarium.maintenance
      .filter((item: any) => item.status === "PENDING")
      .sort(
        (a: any, b: any) =>
          new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
      );

    return pendingMaintenance.length > 0 ? pendingMaintenance[0] : null;
  };

  const nextPendingMaintenance = getNextPendingMaintenance();

  // Получаем дату следующего обслуживания
  const nextService = nextPendingMaintenance
    ? new Date(nextPendingMaintenance.performedAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : notAssignedText || "не назначена";

  useEffect(() => {
    if (!nextPendingMaintenance) {
      setNextServiceStyle("bg-maintenance-default/30");
      setNextServiceDay(notAssignedText || "не назначена");
      return;
    }

    const today = new Date();
    const serviceDate = new Date(nextPendingMaintenance.performedAt);

    const diffInMs = serviceDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      setNextServiceStyle("bg-maintenance-today/30");
      setNextServiceDay(t("today"));
    } else if (diffInDays === 1) {
      setNextServiceStyle("bg-maintenance-tomorrow/30");
      setNextServiceDay(t("tomorrow"));
    } else if (diffInDays === 2) {
      setNextServiceStyle("bg-maintenance-tomorrow/30");
      setNextServiceDay(t("afterTomorrow"));
    } else if (diffInDays === 3) {
      setNextServiceStyle("bg-maintenance-tomorrow/30");
      setNextServiceDay(t("in3Days"));
    } else if (diffInDays > 3) {
      setNextServiceStyle("bg-maintenance-upcoming/30");
      setNextServiceDay(`${t("inDays")} ${diffInDays} ${t("days")}`);
    } else {
      setNextServiceStyle("bg-maintenance-passed/30");
      setNextServiceDay(t("passed"));
    }
  }, [nextPendingMaintenance, notAssignedText, t]);

  return (
    <>
      <motion.div
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="w-[300px] rounded-t-xl mb-10 cursor-pointer shadow-lg bg-white/50 dark:bg-black/50  hover:bg-green-300/50 dark:hover:bg-green-700/20 transition-all duration-300 hover:translate-y-1">
          <Link href={`/myTanks/${aquarium.id}`}>
            <CardContent className="p-0 cursor-pointer">
              {aquarium.images && aquarium.images.length > 0 ? (
                <Image
                  src={mainImgError ? "/app-logo.svg" : aquarium.images[0].url}
                  alt={aquarium.name}
                  className="w-full rounded-t-xl h-40 object-cover"
                  width={300}
                  height={160}
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={() => setMainImgError(true)}
                />
              ) : (
                <Image
                  src={defaultImgError ? "/app-logo.svg" : image}
                  alt={aquarium.name}
                  className="w-full rounded-t-xl h-40 object-cover"
                  width={300}
                  height={160}
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={() => setDefaultImgError(true)}
                />
              )}
              <div className="p-4 ">
                <h3 className="font-semibold mb-2 ">{aquarium.name}</h3>
                <p
                  className={`text-sm ${nextServiceStyle} px-2 py-1 rounded-sm inline-flex flex-col w-full`}
                >
                  <span className="font-bold">{t("nextService")}</span>
                  <span>{nextService}</span>
                  {nextServiceDay !== notAssignedText && (
                    <span>{nextServiceDay}</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </motion.div>
    </>
  );
}
