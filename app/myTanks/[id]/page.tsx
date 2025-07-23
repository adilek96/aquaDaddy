"use client";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import { Button } from "@/components/ui/button";
import LoadingBlock from "@/components/ui/loadingBlock";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function UserAquarium({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("AquariumForm");
  const [aquarium, setAquarium] = useState<any>(null);

  useEffect(() => {
    const fetchAquarium = async () => {
      const aquarium = await fetchUserAquarium({ tankId: id });
      setAquarium(aquarium);
    };
    fetchAquarium();
  }, [id]);

  return (
    <>
      <div className="flex no-wrap justify-between items-center">
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
          {aquarium ? (
            <span>{aquarium.name}</span>
          ) : (
            <div className="inline-block h-8 w-40 rounded bg-muted animate-pulse" />
          )}
        </h2>

        <Link href={`myTanks/edit/${id}`}>
          <Button variant={"ghost"} className="mr-5 bg-red-500">
            <EditIcon />
          </Button>
        </Link>
      </div>
      {/* Подробная информация об аквариуме */}
      {!aquarium ? (
        <LoadingBlock translate={t("loading")} />
      ) : (
        <div className="max-w-3xl mx-auto my-8">
          <div className="bg-white dark:bg-black/40 rounded-xl shadow-lg p-6 flex flex-col gap-6">
            {/* Картинки */}
            {aquarium.images && aquarium.images.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {aquarium.images.map((img: any, idx: number) => (
                  <img
                    key={img.id || idx}
                    src={img.url}
                    alt={aquarium.name}
                    className="rounded-lg w-40 h-32 object-cover border"
                  />
                ))}
              </div>
            )}

            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">{t("description")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.description || (
                    <span className="italic opacity-60">
                      {t("noDescription") || "Нет описания"}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("type")}:</span>
                <div className="text-muted-foreground">
                  {t(aquarium.type?.toLowerCase())}
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("shape")}:</span>
                <div className="text-muted-foreground">{t(aquarium.shape)}</div>
              </div>
              <div>
                <span className="font-semibold">{t("startDate")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.startDate ? (
                    new Date(aquarium.startDate).toLocaleDateString()
                  ) : (
                    <span className="italic opacity-60">
                      {t("notAssigned")}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("length")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.lengthCm ?? (
                    <span className="italic opacity-60">
                      {t("notAssigned")}
                    </span>
                  )}{" "}
                  см
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("width")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.widthCm ?? (
                    <span className="italic opacity-60">
                      {t("notAssigned")}
                    </span>
                  )}{" "}
                  см
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("height")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.heightCm ?? (
                    <span className="italic opacity-60">
                      {t("notAssigned")}
                    </span>
                  )}{" "}
                  см
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("volume")}:</span>
                <div className="text-muted-foreground">
                  {aquarium.volumeLiters ?? (
                    <span className="italic opacity-60">
                      {t("notAssigned")}
                    </span>
                  )}{" "}
                  л
                </div>
              </div>
              <div>
                <span className="font-semibold">
                  {t("createdAt") || "Создан"}:
                </span>
                <div className="text-muted-foreground">
                  {aquarium.createdAt
                    ? new Date(aquarium.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <span className="font-semibold">
                  {t("updatedAt") || "Обновлен"}:
                </span>
                <div className="text-muted-foreground">
                  {aquarium.updatedAt
                    ? new Date(aquarium.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <span className="font-semibold">
                  {t("isPublic") || "Публичный"}:
                </span>
                <div className="text-muted-foreground">
                  {aquarium.isPublic ? t("yes") || "Да" : t("no") || "Нет"}
                </div>
              </div>
            </div>

            {/* Секция: Обитатели */}
            <div className="mt-8">
              <span className="font-semibold text-lg">
                {t("inhabitants") || "Обитатели"}:
              </span>
              {aquarium.inhabitants && aquarium.inhabitants.length > 0 ? (
                <ul className="list-disc ml-6 mt-2">
                  {aquarium.inhabitants.map((inh: any, idx: number) => (
                    <li key={inh.id || idx} className="mb-1">
                      <span className="font-semibold">{inh.species}</span> —{" "}
                      {inh.count} шт.
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="italic opacity-60 mt-2">{t("notAssigned")}</div>
              )}
            </div>

            {/* Секция: Параметры воды */}
            <div className="mt-8">
              <span className="font-semibold text-lg">
                {t("waterParams") || "Параметры воды"}:
              </span>
              {aquarium.waterParams ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    pH:{" "}
                    <span className="text-muted-foreground">
                      {aquarium.waterParams.pH ?? t("notAssigned")}
                    </span>
                  </div>
                  <div>
                    {t("temperature") || "Температура"}:{" "}
                    <span className="text-muted-foreground">
                      {aquarium.waterParams.temperatureC ?? t("notAssigned")}
                    </span>
                  </div>
                  <div>
                    {t("hardness") || "Жёсткость"}:{" "}
                    <span className="text-muted-foreground">
                      {aquarium.waterParams.hardness ?? t("notAssigned")}
                    </span>
                  </div>
                  <div>
                    {t("nitrates") || "Нитраты"}:{" "}
                    <span className="text-muted-foreground">
                      {aquarium.waterParams.nitrates ?? t("notAssigned")}
                    </span>
                  </div>
                  <div>
                    {t("updatedAt") || "Обновлено"}:{" "}
                    <span className="text-muted-foreground">
                      {aquarium.waterParams.lastUpdated
                        ? new Date(
                            aquarium.waterParams.lastUpdated
                          ).toLocaleString()
                        : t("notAssigned")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="italic opacity-60 mt-2">{t("notAssigned")}</div>
              )}
            </div>

            {/* Секция: Напоминания */}
            <div className="mt-8">
              <span className="font-semibold text-lg">
                {t("reminders") || "Напоминания"}:
              </span>
              {aquarium.reminders && aquarium.reminders.length > 0 ? (
                <ul className="list-disc ml-6 mt-2">
                  {aquarium.reminders.map((rem: any, idx: number) => (
                    <li key={rem.id || idx} className="mb-1">
                      <span className="font-semibold">{rem.title}</span> —{" "}
                      {rem.remindAt
                        ? new Date(rem.remindAt).toLocaleDateString()
                        : t("notAssigned")}{" "}
                      {rem.isCompleted ? `(${t("yes")})` : `(${t("no")})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="italic opacity-60 mt-2">{t("notAssigned")}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        fillRule="evenodd"
        d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
