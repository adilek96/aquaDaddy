"use client";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import { Button } from "@/components/ui/button";
import LoadingBlock from "@/components/ui/loadingBlock";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { measurCalcInch } from "@/components/helpers/measurCalcInch";
import { measurCalcGal } from "@/components/helpers/mesurCalcGal";

export default function UserAquarium({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [aquarium, setAquarium] = useState<any>(null);
  const [currentMeasurementSystem, setCurrentMeasurementSystem] =
    useState<string>("metric");

  useEffect(() => {
    const fetchAquarium = async () => {
      const aquarium = await fetchUserAquarium({ tankId: id });
      setAquarium(aquarium);
    };
    fetchAquarium();
  }, [id]);

  // Получаем систему измерения из localStorage
  useEffect(() => {
    const measurementSystem = localStorage.getItem("measurement_system");
    if (measurementSystem) {
      setCurrentMeasurementSystem(measurementSystem);
    }
  }, []);

  // Слушаем изменения системы измерения
  useEffect(() => {
    const handleMeasurementChange = (event: CustomEvent) => {
      setCurrentMeasurementSystem(event.detail);
    };

    window.addEventListener(
      "measurementSystemChanged",
      handleMeasurementChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "measurementSystemChanged",
        handleMeasurementChange as EventListener
      );
  }, []);

  // Функции для получения единиц измерения
  const getLengthUnit = () =>
    currentMeasurementSystem === "imperial" ? " (in)" : " (cm)";
  const getVolumeUnit = () =>
    currentMeasurementSystem === "imperial" ? " (gal)" : " (L)";

  // Функции для конвертации значений
  const convertLength = (value: number | null) => {
    if (value === null) return null;
    return measurCalcInch(value, currentMeasurementSystem);
  };

  const convertVolume = (value: number | null) => {
    if (value === null) return null;
    return measurCalcGal(value, currentMeasurementSystem);
  };

  // Функция для отображения размеров в зависимости от формы
  const renderDimensions = () => {
    if (!aquarium) return null;

    const shape = aquarium.shape;

    switch (shape) {
      case "rectangular":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("length")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.lengthCm
                  ? `${convertLength(aquarium.lengthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("width")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.widthCm
                  ? `${convertLength(aquarium.widthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("height")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "cube":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("length")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.lengthCm
                  ? `${convertLength(aquarium.lengthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("height")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "cylinder":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("diameter")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.diameterCm
                  ? `${convertLength(aquarium.diameterCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("height")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "sphere":
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("diameter")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.diameterCm
                  ? `${convertLength(aquarium.diameterCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "hemisphere":
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("diameter")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.diameterCm
                  ? `${convertLength(aquarium.diameterCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "hexagon":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("side")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.sideCm
                  ? `${convertLength(aquarium.sideCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("height")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      case "bow":
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("width")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.widthCm
                  ? `${convertLength(aquarium.widthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("height")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("depth")}
                {getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.depthCm
                  ? `${convertLength(aquarium.depthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("bowK")}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.k ? `${aquarium.k}` : "0.9"}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                {t("volume")}
                {getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                Length{getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.lengthCm
                  ? `${convertLength(aquarium.lengthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                Width{getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.widthCm
                  ? `${convertLength(aquarium.widthCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                Height{getLengthUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.heightCm
                  ? `${convertLength(aquarium.heightCm)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
            <div className="group">
              <div className="text-xs uppercase tracking-widest mb-1">
                Volume{getVolumeUnit()}
              </div>
              <div className="text-sm font-medium transition-colors">
                {aquarium.volumeLiters
                  ? `${convertVolume(aquarium.volumeLiters)?.toFixed(1)}`
                  : t("notAssigned")}
              </div>
            </div>
          </div>
        );
    }
  };

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
      </div>
      {/* Подробная информация об аквариуме */}
      {!aquarium ? (
        <LoadingBlock translate={t("loading")} />
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Primary Info */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-xs md:text-sm lg:text-xl w-full font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold inline-flex justify-between">
                  {tDetails("description")}
                  <span>
                    <Button
                      variant={"ghost"}
                      className="mr-5 bg-red-500 "
                      title={tDetails("editAquarium")}
                    >
                      <EditIcon className="text-white" />
                    </Button>
                  </span>
                </h2>
                <p className=" leading-relaxed">
                  {aquarium.description || t("noDescription")}
                </p>
              </div>

              {/* Dimensions Grid */}
              <div>
                <h2 className="text-xs md:text-sm lg:text-xl w-full font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold inline-flex justify-between">
                  {tDetails("specifications")}
                  <span>
                    <Button
                      variant={"ghost"}
                      className="mr-5 bg-red-500 "
                      title={tDetails("editAquarium")}
                    >
                      <EditIcon className="text-white" />
                    </Button>
                  </span>
                </h2>
                {renderDimensions()}
              </div>

              {/* Content */}
              <div>
                <h2 className="text-xs md:text-sm lg:text-xl w-full font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold inline-flex justify-between">
                  {tDetails("content")}
                  <span>
                    <Button
                      variant={"ghost"}
                      className="mr-5 bg-red-500 "
                      title={tDetails("editAquarium")}
                    >
                      <EditIcon className="text-white" />
                    </Button>
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group">
                    <div className="text-xs  uppercase tracking-widest  mb-1">
                      {t("inhabitants")}
                    </div>
                    <div className="text-sm font-medium  transition-colors">
                      {aquarium.inhabitants || t("notAssigned")}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-xs  uppercase tracking-widest  mb-1">
                      {t("waterParams")}
                    </div>
                    <div className="text-sm font-medium  transition-colors">
                      {aquarium.waterParameters || t("notAssigned")}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-xs  uppercase tracking-widest  mb-1">
                      {t("reminders")}
                    </div>
                    <div className="text-sm font-medium  transition-colors">
                      {aquarium.reminders || t("notAssigned")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="text-xs md:text-sm lg:text-xl w-full font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold inline-flex justify-between">
                  {tDetails("timeline")}
                  <span>
                    <Button
                      variant={"ghost"}
                      className="mr-5 bg-red-500 "
                      title={tDetails("editAquarium")}
                    >
                      <EditIcon className="text-white" />
                    </Button>
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {tDetails("startDate")}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {aquarium.startDate
                            ? new Date(aquarium.startDate).toLocaleDateString()
                            : t("notAssigned")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-12">
              {/* Quick Stats */}
              <div className="p-6 rounded-none">
                <div className="text-xs md:text-sm lg:text-xl w-full font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold inline-flex justify-between">
                  {tDetails("overview")}
                  <span>
                    <Button
                      variant={"ghost"}
                      className="mr-5 bg-red-500 "
                      title={tDetails("editAquarium")}
                    >
                      <EditIcon className="text-white" />
                    </Button>
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b  last:border-0">
                    <span className="text-sm ">{t("type")}</span>
                    <span className="text-sm font-medium ">
                      {aquarium.type
                        ? t(
                            aquarium.type.toLowerCase() as
                              | "freshwater"
                              | "saltwater"
                              | "paludarium"
                          )
                        : t("notAssigned")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b  last:border-0">
                    <span className="text-sm ">{t("shape")}</span>
                    <span className="text-sm font-medium ">
                      {aquarium.shape ? t(aquarium.shape) : t("notAssigned")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b  last:border-0">
                    <span className="text-sm ">{tDetails("public")}</span>
                    <span className="text-sm font-medium ">
                      {aquarium.isPublic ? t("yes") : t("no")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div>
                <div className="text-xs md:text-sm lg:text-xl font-bebas  uppercase leading-none  tracking-wide  mb-6 border-b  pb-2 font-bold">
                  {tDetails("maintenance")}
                </div>
                <div className="space-y-4">
                  <div className="p-4 border  ">
                    <div className="text-xs  uppercase tracking-widest  mb-2">
                      {tDetails("nextService")}
                    </div>
                    <div className="text-sm ">
                      {aquarium.reminders && aquarium.reminders.length > 0
                        ? new Date(
                            aquarium.reminders[0].remindAt
                          ).toLocaleDateString()
                        : tDetails("noScheduledMaintenance")}
                    </div>
                  </div>
                </div>
              </div>
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
      width="14"
      height="14"
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
