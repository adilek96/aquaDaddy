"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TankCard({
  aquarium,
  notAssignedText,
}: {
  aquarium: any;
  notAssignedText?: string;
}) {
  const t = useTranslations("AquariumForm");
  const [nextServiseStyle, setNextServiseStyle] = useState("bg-white/30");
  const [nextServiceDay, setNextServiceDay] = useState("notAssignedText");
  const image = aquarium.image || "/app-logo.svg";

  // Получаем ближайшее напоминание как nextService
  const nextService =
    aquarium.reminders && aquarium.reminders.length > 0
      ? new Date(aquarium.reminders[0].remindAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : notAssignedText || "не назначена";

  useEffect(() => {
    if (!aquarium.reminders || aquarium.reminders.length === 0) {
      setNextServiseStyle("bg-white/30");
      setNextServiceDay(notAssignedText || "не назначена");
      return;
    }

    const today = new Date();
    const serviceDate = new Date(aquarium.reminders[0].remindAt);

    const diffInMs = serviceDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      setNextServiseStyle("bg-red-500/30");
      setNextServiceDay(t("today"));
    } else if (diffInDays === 1) {
      setNextServiseStyle("bg-yellow-400/30");
      setNextServiceDay(t("tomorrow"));
    } else if (diffInDays === 2) {
      setNextServiseStyle("bg-yellow-400/30");
      setNextServiceDay(t("afterTomorrow"));
    } else if (diffInDays === 3) {
      setNextServiseStyle("bg-yellow-400/30");
      setNextServiceDay(t("in3Days"));
    } else if (diffInDays > 3) {
      setNextServiseStyle("bg-green-500/30");
      setNextServiceDay(`${t("inDays")} ${diffInDays} ${t("days")}`);
    } else {
      setNextServiseStyle("bg-white/30");
      setNextServiceDay(t("passed"));
    }
  }, [aquarium.reminders, notAssignedText]);

  return (
    <>
      <Card className="w-[300px] rounded-t-xl mb-10 cursor-pointer shadow-lg bg-white/50 dark:bg-black/50  hover:bg-green-300/50 dark:hover:bg-green-700/20 transition-all duration-300 hover:translate-y-1">
        <Link href={`/myTanks/${aquarium.id}`}>
          <CardContent className="p-0 cursor-pointer">
            <img
              src={image}
              alt={aquarium.name}
              className="w-full rounded-t-xl h-40 object-cover"
            />
            <div className="p-4 ">
              <h3 className="font-semibold mb-2 ">{aquarium.name}</h3>
              <p
                className={`text-sm  ${nextServiseStyle} px-2 py-1 rounded-sm inline-flex flex-col w-full`}
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
    </>
  );
}
