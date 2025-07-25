"use client";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import { Button } from "@/components/ui/button";
import LoadingBlock from "@/components/ui/loadingBlock";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { measurCalcInch } from "@/components/helpers/measurCalcInch";
import { measurCalcGal } from "@/components/helpers/mesurCalcGal";
import { FaEdit } from "react-icons/fa";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold my-6 sm:my-10 font-bebas leading-none tracking-wide cursor-default inline-flex flex-wrap">
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
            <span className="text-wrap">{aquarium.name}</span>
          ) : (
            <div className="inline-block h-6 sm:h-8 w-32 sm:w-40 rounded bg-muted animate-pulse" />
          )}
        </h2>
      </div>
      {/* Подробная информация об аквариуме */}
      {!aquarium ? (
        <LoadingBlock translate={t("loading")} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column - Primary Info */}
            <div className="lg:col-span-8 space-y-8 sm:space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("description")}</span>
                  <button
                    type="button"
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform"
                    title={tDetails("editAquarium")}
                  >
                    <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  {aquarium.description || t("noDescription")}
                </p>
              </div>

              {/* Dimensions Grid */}
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("specifications")}</span>
                  <button
                    type="button"
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform"
                    title={tDetails("editAquarium")}
                  >
                    <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </h2>
                {renderDimensions()}
              </div>

              {/* Content */}
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("content")}</span>
                  <button
                    type="button"
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform"
                    title={tDetails("editAquarium")}
                  >
                    <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <div className="group">
                    <div className="text-xs uppercase tracking-widest mb-1">
                      {t("inhabitants")}
                    </div>
                    <div className="text-sm font-medium transition-colors">
                      {aquarium.inhabitants || t("notAssigned")}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-xs uppercase tracking-widest mb-1">
                      {t("waterParams")}
                    </div>
                    <div className="text-sm font-medium transition-colors">
                      {aquarium.waterParameters || t("notAssigned")}
                    </div>
                  </div>
                  <div className="group sm:col-span-2 lg:col-span-1">
                    <div className="text-xs uppercase tracking-widest mb-1">
                      {t("reminders")}
                    </div>
                    <div className="text-sm font-medium transition-colors">
                      {aquarium.reminders || t("notAssigned")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("timeline")}</span>
                  <button
                    type="button"
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform"
                    title={tDetails("editAquarium")}
                  >
                    <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-2 h-2 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
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
            <div className="lg:col-span-4 space-y-8 sm:space-y-12">
              {/* Quick Stats */}
              <div className="p-4 sm:p-6 rounded-none border">
                <div className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("overview")}</span>
                  <button
                    type="button"
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform"
                    title={tDetails("editAquarium")}
                  >
                    <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b last:border-0 gap-1 sm:gap-0">
                    <span className="text-sm">{t("type")}</span>
                    <span className="text-sm font-medium">
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b last:border-0 gap-1 sm:gap-0">
                    <span className="text-sm">{t("shape")}</span>
                    <span className="text-sm font-medium">
                      {aquarium.shape ? t(aquarium.shape) : t("notAssigned")}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b last:border-0 gap-1 sm:gap-0">
                    <span className="text-sm">{tDetails("public")}</span>
                    <span className="text-sm font-medium">
                      {aquarium.isPublic ? t("yes") : t("no")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div>
                <div className="text-sm sm:text-base lg:text-xl font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold">
                  {tDetails("maintenance")}
                </div>
                <div className="space-y-4">
                  <div className="p-4 border">
                    <div className="text-xs uppercase tracking-widest mb-2">
                      {tDetails("nextService")}
                    </div>
                    <div className="text-sm">
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
