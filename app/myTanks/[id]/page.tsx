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
import {
  FaTint,
  FaThermometerHalf,
  FaFlask,
  FaWater,
  FaLeaf,
  FaCircle,
  FaAtom,
} from "react-icons/fa";
import {
  DescriptionEditModal,
  SpecificationsEditModal,
  InhabitantsEditModal,
  WaterParamsEditModal,
  RemindersEditModal,
  TimelineEditModal,
  OverviewEditModal,
} from "@/components/component/aquariumEditModals";
import {
  updateAquariumDescription,
  updateAquariumSpecifications,
  updateAquariumContent,
  updateAquariumTimeline,
  updateAquariumOverview,
  updateWaterParameters,
} from "@/app/actions/aquariumUpdateAction";

export default function UserAquarium({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [aquarium, setAquarium] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMeasurementSystem, setCurrentMeasurementSystem] =
    useState<string>("metric");

  // Состояния для модальных окон
  const [modalStates, setModalStates] = useState({
    description: false,
    specifications: false,
    inhabitants: false,
    waterParams: false,
    reminders: false,
    timeline: false,
    overview: false,
  });

  // Состояния загрузки для каждой секции
  const [loadingStates, setLoadingStates] = useState({
    description: false,
    specifications: false,
    inhabitants: false,
    waterParams: false,
    reminders: false,
    timeline: false,
    overview: false,
  });

  // Состояние для шкалы температуры
  const [temperatureScale, setTemperatureScale] = useState<
    "celsius" | "fahrenheit"
  >("celsius");

  useEffect(() => {
    const fetchAquarium = async () => {
      setIsLoading(true);
      try {
        const aquarium = await fetchUserAquarium({ tankId: id });
        setAquarium(aquarium);
      } catch (error) {
        console.error("Error fetching aquarium:", error);
      } finally {
        setIsLoading(false);
      }
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

  // Получаем шкалу температуры из localStorage
  useEffect(() => {
    const scale = localStorage.getItem("temperature_scales");
    if (scale === "f") {
      setTemperatureScale("fahrenheit");
    } else {
      setTemperatureScale("celsius");
    }
  }, []);

  // Слушаем изменения системы измерения
  useEffect(() => {
    const handleStorageChange = () => {
      const scale = localStorage.getItem("temperature_scales");
      if (scale === "f") {
        setTemperatureScale("fahrenheit");
      } else {
        setTemperatureScale("celsius");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Также слушаем кастомные события для изменений в том же окне
    window.addEventListener("temperatureScaleChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "temperatureScaleChanged",
        handleStorageChange
      );
    };
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

  // Функции для управления модальными окнами
  const openModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev: typeof modalStates) => ({
      ...prev,
      [modalName]: true,
    }));
  };

  const closeModal = (modalName: keyof typeof modalStates) => {
    setModalStates((prev: typeof modalStates) => ({
      ...prev,
      [modalName]: false,
    }));
  };

  // Функции для сохранения данных
  const handleSaveDescription = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, description: true }));
    try {
      const result = await updateAquariumDescription(id, data.description);
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          description: result.data!.description,
          waterParams: result.data!.waterParams,
          inhabitants: result.data!.inhabitants,
          reminders: result.data!.reminders,
        }));
      } else {
        console.error("Failed to save description:", result.error);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, description: false }));
    }
  };

  const handleSaveSpecifications = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, specifications: true }));
    try {
      const result = await updateAquariumSpecifications(id, data);
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          ...data,
          waterParams: result.data!.waterParams,
          inhabitants: result.data!.inhabitants,
          reminders: result.data!.reminders,
        }));
      } else {
        console.error("Failed to save specifications:", result.error);
      }
    } catch (error) {
      console.error("Error saving specifications:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, specifications: false }));
    }
  };

  // Обработчики сохранения для новых секций
  const handleSaveInhabitants = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, inhabitants: true }));
    try {
      const result = await updateAquariumContent(id, {
        inhabitants: data.inhabitants,
      });
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          inhabitants: result.data!.inhabitants,
          waterParams: result.data!.waterParams,
          reminders: result.data!.reminders,
        }));
      } else {
        console.error("Failed to save inhabitants:", result.error);
      }
    } catch (error) {
      console.error("Error saving inhabitants:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, inhabitants: false }));
    }
  };

  // Обработчик сохранения параметров воды
  const handleSaveWaterParams = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, waterParams: true }));
    try {
      const result = await updateWaterParameters(id, data.waterParameters);
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          waterParams: result.data,
        }));
      } else {
        console.error("Failed to save water parameters:", result.error);
      }
    } catch (error) {
      console.error("Error saving water parameters:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, waterParams: false }));
    }
  };

  const handleSaveReminders = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, reminders: true }));
    try {
      const result = await updateAquariumContent(id, {
        reminders: data.reminders,
      });
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          reminders: result.data!.reminders,
          waterParams: result.data!.waterParams,
          inhabitants: result.data!.inhabitants,
        }));
      } else {
        console.error("Failed to save reminders:", result.error);
      }
    } catch (error) {
      console.error("Error saving reminders:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, reminders: false }));
    }
  };

  const handleSaveTimeline = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, timeline: true }));
    try {
      const result = await updateAquariumTimeline(id, data.startDate);
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          startDate: result.data!.startDate,
          waterParams: result.data!.waterParams,
          inhabitants: result.data!.inhabitants,
          reminders: result.data!.reminders,
        }));
      } else {
        console.error("Failed to save timeline:", result.error);
      }
    } catch (error) {
      console.error("Error saving timeline:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, timeline: false }));
    }
  };

  const handleSaveOverview = async (data: any) => {
    setLoadingStates((prev) => ({ ...prev, overview: true }));
    try {
      const result = await updateAquariumOverview(id, data);
      if (result.success && result.data) {
        setAquarium((prev: any) => ({
          ...prev,
          ...data,
          waterParams: result.data!.waterParams,
          inhabitants: result.data!.inhabitants,
          reminders: result.data!.reminders,
        }));
      } else {
        console.error("Failed to save overview:", result.error);
      }
    } catch (error) {
      console.error("Error saving overview:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, overview: false }));
    }
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
      {isLoading ? (
        <LoadingBlock translate={t("loading")} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 cursor-default">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Mobile Overview and Maintenance - Show first on mobile */}
            <div className="lg:hidden space-y-8 sm:space-y-12">
              {/* Quick Stats */}
              <div className="p-4 sm:p-6 rounded-none border">
                <div className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("overview")}</span>
                  <button
                    type="button"
                    id="editAquariumOverview"
                    onClick={() => openModal("overview")}
                    disabled={loadingStates.overview}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.overview ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
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
                  <Link href={`/myTanks/${id}/maintenance`}>
                    <div
                      className="p-4 border bg-background hover:bg-green-500/40 border-muted rounded-xl shadow-sm transition-colors duration-200 cursor-pointer"
                      style={{ borderColor: "hsl(var(--border))" }}
                    >
                      <div className="text-xs uppercase tracking-widest mb-2">
                        {tDetails("maintenance")}
                      </div>
                      <div className="text-sm">
                        {aquarium.reminders && aquarium.reminders.length > 0
                          ? new Date(
                              aquarium.reminders[0].remindAt
                            ).toLocaleDateString()
                          : tDetails("noScheduledMaintenance")}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Left Column - Primary Info */}
            <div className="lg:col-span-8 space-y-8 sm:space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("description")}</span>
                  <button
                    type="button"
                    id="editAquariumDescription"
                    onClick={() => openModal("description")}
                    disabled={loadingStates.description}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.description ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
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
                    id="editAquariumSpecifications"
                    onClick={() => openModal("specifications")}
                    disabled={loadingStates.specifications}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.specifications ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </h2>
                {renderDimensions()}
              </div>

              {/* Content */}
              <div className="cursor-default">
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{t("inhabitants")}</span>
                  <button
                    type="button"
                    id="editAquariumInhabitants"
                    onClick={() => openModal("inhabitants")}
                    disabled={loadingStates.inhabitants}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.inhabitants ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </h2>
                <div className="text-sm font-medium transition-colors">
                  {aquarium.inhabitants && aquarium.inhabitants.length > 0
                    ? aquarium.inhabitants
                        .map(
                          (inhabitant: any) =>
                            `${inhabitant.species} (${inhabitant.count})`
                        )
                        .join(", ")
                    : t("notAssigned")}
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{t("waterParams")}</span>
                  <button
                    type="button"
                    id="editAquariumWaterParams"
                    onClick={() => openModal("waterParams")}
                    disabled={loadingStates.waterParams}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.waterParams ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </h2>
                <div className="text-sm font-medium transition-colors">
                  {aquarium.waterParams &&
                  Object.keys(aquarium.waterParams).some(
                    (key) =>
                      key !== "aquariumId" &&
                      key !== "id" &&
                      key !== "lastUpdated" &&
                      aquarium.waterParams[key] !== null &&
                      aquarium.waterParams[key] !== undefined &&
                      aquarium.waterParams[key] !== ""
                  ) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 cursor-default">
                      {Object.entries(aquarium.waterParams)
                        .filter(
                          ([key, value]) =>
                            key !== "aquariumId" &&
                            key !== "id" &&
                            key !== "lastUpdated" &&
                            value !== null &&
                            value !== undefined &&
                            value !== ""
                        )
                        .map(([key, value]) => {
                          let label = key;
                          let icon = (
                            <FaFlask className="text-muted-foreground w-5 h-5" />
                          );
                          let displayValue = String(value);
                          switch (key) {
                            case "pH":
                              label = "pH";
                              icon = (
                                <FaTint className="text-blue-500 w-5 h-5" />
                              );
                              break;
                            case "temperatureC":
                              if (temperatureScale === "fahrenheit") {
                                // Переводим из цельсия в фаренгейты для отображения
                                displayValue = `${(
                                  (Number(value) * 9) / 5 +
                                  32
                                ).toFixed(1)}°F`;
                                label = t("temperature") + " (°F)";
                              } else {
                                displayValue = `${value}°C`;
                                label = t("temperature") + " (°C)";
                              }
                              icon = (
                                <FaThermometerHalf className="text-red-500 w-5 h-5" />
                              );
                              break;
                            case "KH":
                              label = "KH";
                              icon = (
                                <FaAtom className="text-yellow-500 w-5 h-5" />
                              );
                              break;
                            case "GH":
                              label = "GH";
                              icon = (
                                <FaAtom className="text-yellow-700 w-5 h-5" />
                              );
                              break;
                            case "NH3":
                              label = "NH3";
                              icon = (
                                <FaFlask className="text-green-600 w-5 h-5" />
                              );
                              break;
                            case "NH4":
                              label = "NH4";
                              icon = (
                                <FaFlask className="text-green-700 w-5 h-5" />
                              );
                              break;
                            case "NO2":
                              label = "NO2";
                              icon = (
                                <FaFlask className="text-purple-500 w-5 h-5" />
                              );
                              break;
                            case "NO3":
                              label = "NO3";
                              icon = (
                                <FaFlask className="text-purple-700 w-5 h-5" />
                              );
                              break;
                            case "PO4":
                              label = "PO4";
                              icon = (
                                <FaFlask className="text-pink-500 w-5 h-5" />
                              );
                              break;
                            case "K":
                              label = "K";
                              icon = (
                                <FaLeaf className="text-green-500 w-5 h-5" />
                              );
                              break;
                            case "Fe":
                              label = "Fe";
                              icon = (
                                <FaCircle className="text-orange-500 w-5 h-5" />
                              );
                              break;
                            case "Mg":
                              label = "Mg";
                              icon = (
                                <FaCircle className="text-blue-400 w-5 h-5" />
                              );
                              break;
                            case "Ca":
                              label = "Ca";
                              icon = (
                                <FaCircle className="text-gray-400 w-5 h-5" />
                              );
                              break;
                            case "salinity":
                              label = t("salinity");
                              icon = (
                                <FaWater className="text-cyan-500 w-5 h-5" />
                              );
                              break;
                            default:
                              label = key;
                              icon = (
                                <FaFlask className="text-muted-foreground w-5 h-5" />
                              );
                          }
                          return (
                            <div
                              key={key}
                              className="flex flex-col items-center justify-center bg-background hover:bg-green-500/40 border border-muted rounded-xl shadow-sm p-3 min-w-0"
                            >
                              <span className="mb-1">{icon}</span>
                              <span
                                className="text-xs text-muted-foreground text-center mb-0.5 truncate w-full"
                                title={label}
                              >
                                {label}
                              </span>
                              <span className="font-bold text-base text-center break-all">
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    t("notAssigned")
                  )}
                  {/* lastUpdated отдельным блоком */}
                  {aquarium.waterParams && aquarium.waterParams.lastUpdated && (
                    <div className="mt-2 text-xs text-muted-foreground pt-3">
                      <strong>{t("lastUpdatedLabel")} </strong>
                      {new Date(
                        aquarium.waterParams.lastUpdated
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{t("reminders")}</span>
                  <button
                    type="button"
                    id="editAquariumReminders"
                    onClick={() => openModal("reminders")}
                    disabled={loadingStates.reminders}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.reminders ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </h2>
                <div className="text-sm font-medium transition-colors">
                  {aquarium.reminders && aquarium.reminders.length > 0
                    ? aquarium.reminders
                        .map(
                          (reminder: any) =>
                            `${reminder.title} (${new Date(
                              reminder.remindAt
                            ).toLocaleDateString()})`
                        )
                        .join(", ")
                    : t("notAssigned")}
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("timeline")}</span>
                  <button
                    type="button"
                    id="editAquariumTimeline"
                    onClick={() => openModal("timeline")}
                    disabled={loadingStates.timeline}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.timeline ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
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
            <div className="hidden lg:block lg:col-span-4 space-y-8 sm:space-y-12">
              {/* Quick Stats */}
              <div className="p-4 sm:p-6 rounded-none border">
                <div className="text-sm sm:text-base lg:text-xl w-full font-bebas uppercase leading-none tracking-wide mb-4 sm:mb-6 border-b pb-2 font-bold flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{tDetails("overview")}</span>
                  <button
                    type="button"
                    id="editAquariumOverview"
                    onClick={() => openModal("overview")}
                    disabled={loadingStates.overview}
                    className="mt-2 sm:mt-0 sm:mr-5 p-2 rounded-lg hover:translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title={tDetails("editAquarium")}
                  >
                    {loadingStates.overview ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
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
                  <Link href={`/myTanks/${id}/maintenance`}>
                    <div className="p-4 bg-background hover:bg-green-500/40 border-muted rounded-xl shadow-sm transition-colors duration-200 cursor-pointer">
                      <div className="text-xs uppercase tracking-widest mb-2">
                        {tDetails("maintenance")}
                      </div>
                      <div className="text-sm">
                        {aquarium.reminders && aquarium.reminders.length > 0
                          ? new Date(
                              aquarium.reminders[0].remindAt
                            ).toLocaleDateString()
                          : tDetails("noScheduledMaintenance")}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальные окна */}
      <DescriptionEditModal
        isOpen={modalStates.description}
        onClose={() => closeModal("description")}
        aquarium={aquarium}
        onSave={handleSaveDescription}
        section="description"
      />
      <SpecificationsEditModal
        isOpen={modalStates.specifications}
        onClose={() => closeModal("specifications")}
        aquarium={aquarium}
        onSave={handleSaveSpecifications}
        section="specifications"
      />
      <InhabitantsEditModal
        isOpen={modalStates.inhabitants}
        onClose={() => closeModal("inhabitants")}
        aquarium={aquarium}
        onSave={handleSaveInhabitants}
        section="inhabitants"
      />
      <WaterParamsEditModal
        isOpen={modalStates.waterParams}
        onClose={() => closeModal("waterParams")}
        aquarium={aquarium}
        onSave={handleSaveWaterParams}
        section="waterParams"
      />
      <RemindersEditModal
        isOpen={modalStates.reminders}
        onClose={() => closeModal("reminders")}
        aquarium={aquarium}
        onSave={handleSaveReminders}
        section="reminders"
      />
      <TimelineEditModal
        isOpen={modalStates.timeline}
        onClose={() => closeModal("timeline")}
        aquarium={aquarium}
        onSave={handleSaveTimeline}
        section="timeline"
      />
      <OverviewEditModal
        isOpen={modalStates.overview}
        onClose={() => closeModal("overview")}
        aquarium={aquarium}
        onSave={handleSaveOverview}
        section="overview"
      />
    </>
  );
}
