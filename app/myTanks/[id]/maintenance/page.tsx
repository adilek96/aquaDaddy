"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import {
  fetchMaintenanceData,
  createMaintenance,
  updateMaintenance,
  updateOldPendingMaintenance,
} from "@/app/actions/maintenanceFetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, X, RefreshCw } from "lucide-react";
import Link from "next/link";

import LoadingBlock from "@/components/ui/loadingBlock";
import { useMaintenanceEditStore } from "@/store/maintenanceEditStore";
import { useMaintenanceAddStore } from "@/store/maintenanceAddStore";
import { useWaterParamsStore } from "@/store/waterParamsStore";
import WaterParametersCards from "@/components/component/waterParametersCards";

interface MaintenanceData {
  id: string;
  performedAt: Date;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "SKIPPED";
  type: (
    | "WATER_CHANGE"
    | "GRAVEL_CLEANING"
    | "GLASS_CLEANING"
    | "FILTER_CLEANING"
    | "PARAMETER_CHECK"
    | "PLANT_CARE"
    | "CORAL_CARE"
    | "SUPPLEMENTS"
    | "ALGAE_CONTROL"
    | "OTHER"
  )[];
  description: string;
  WaterLog?: any[];
}

export default function MaintenancePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [aquarium, setAquarium] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceData | null>(null);
  const [showStartDateInfo, setShowStartDateInfo] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [temperatureScale, setTemperatureScale] = useState<
    "celsius" | "fahrenheit"
  >("celsius");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const aquariumData = await fetchUserAquarium({ tankId: id });
        setAquarium(aquariumData);

        // Загружаем данные обслуживания
        const maintenanceResult = await fetchMaintenanceData(id);
        if (maintenanceResult.success && maintenanceResult.data) {
          const formattedData = maintenanceResult.data.map((item: any) => ({
            id: item.id,
            performedAt: new Date(item.performedAt),
            status: item.status,
            type: item.type,
            description: item.description,
            WaterLog: item.WaterLog,
          }));
          setMaintenanceData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Получаем шкалу температуры из localStorage
  useEffect(() => {
    const scale = localStorage.getItem("temperature_scales");
    if (scale === "f") {
      setTemperatureScale("fahrenheit");
    } else {
      setTemperatureScale("celsius");
    }
  }, []);

  // Слушаем изменения шкалы температуры
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getMaintenanceForDate = (date: Date) => {
    return maintenanceData.filter((maintenance) => {
      const maintenanceDate = new Date(maintenance.performedAt);
      return (
        maintenanceDate.getDate() === date.getDate() &&
        maintenanceDate.getMonth() === date.getMonth() &&
        maintenanceDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string, date: Date) => {
    // Сравниваем только даты, без времени
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const isPast = compareDate < today;
    const isToday = compareDate.getTime() === today.getTime();

    switch (status) {
      case "COMPLETED":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-black";
      case "SKIPPED":
        return isPast ? "border-2 border-red-500" : "border-2 border-red-300";
      case "PENDING":
        if (isToday) {
          return "bg-green-500"; // Сегодняшняя дата с PENDING статусом должна быть зеленой
        }
        return isPast ? "bg-red-500" : "bg-green-500";
      default:
        return "";
    }
  };

  const isStartDate = (date: Date) => {
    if (!aquarium?.startDate) return false;

    const startDate = new Date(aquarium.startDate);
    startDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return startDate.getTime() === compareDate.getTime();
  };

  const getMaintenanceTypeLabel = (
    type:
      | "WATER_CHANGE"
      | "GRAVEL_CLEANING"
      | "GLASS_CLEANING"
      | "FILTER_CLEANING"
      | "PARAMETER_CHECK"
      | "PLANT_CARE"
      | "CORAL_CARE"
      | "SUPPLEMENTS"
      | "ALGAE_CONTROL"
      | "OTHER"
  ) => {
    const typeLabels: { [key: string]: string } = {
      WATER_CHANGE: tDetails("maintenanceTypes.WATER_CHANGE"),
      GRAVEL_CLEANING: tDetails("maintenanceTypes.GRAVEL_CLEANING"),
      GLASS_CLEANING: tDetails("maintenanceTypes.GLASS_CLEANING"),
      FILTER_CLEANING: tDetails("maintenanceTypes.FILTER_CLEANING"),
      PARAMETER_CHECK: tDetails("maintenanceTypes.PARAMETER_CHECK"),
      PLANT_CARE: tDetails("maintenanceTypes.PLANT_CARE"),
      CORAL_CARE: tDetails("maintenanceTypes.CORAL_CARE"),
      SUPPLEMENTS: tDetails("maintenanceTypes.SUPPLEMENTS"),
      ALGAE_CONTROL: tDetails("maintenanceTypes.ALGAE_CONTROL"),
      OTHER: tDetails("maintenanceTypes.OTHER"),
    };
    return typeLabels[type] || type;
  };

  const { openModal: openAddModal } = useMaintenanceAddStore();
  const { openModal: openWaterParamsModal } = useWaterParamsStore();

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    // Сохраняем выбранную дату для визуального выделения
    setClickedDate(date);

    // Проверяем, есть ли обслуживание на эту дату
    const maintenanceForDay = getMaintenanceForDate(date);

    if (maintenanceForDay.length > 0) {
      // Если есть обслуживание, показываем информацию о первом
      setSelectedMaintenance(maintenanceForDay[0]);
      // Скрываем блок с информацией о дате запуска
      setShowStartDateInfo(false);
      setSelectedDate(null);
    } else if (clickedDate >= today) {
      // Если нет обслуживания и дата будущая, показываем форму добавления
      setSelectedDate(date);
      openAddModal(date, (newMaintenanceData, selectedDate) =>
        handleAddMaintenance(newMaintenanceData, selectedDate)
      );
      // Скрываем другие блоки
      setSelectedMaintenance(null);
      setShowStartDateInfo(false);
    } else if (isStartDate(date)) {
      // Если это дата запуска аквариума, показываем специальную информацию
      setSelectedDate(date);
      setShowStartDateInfo(true);
      // Скрываем блок с информацией об обслуживании
      setSelectedMaintenance(null);
    }
  };

  const handleAddMaintenance = async (newMaintenanceData: any, date: Date) => {
    if (!date || newMaintenanceData.type.length === 0) {
      return;
    }

    try {
      console.log("Sending maintenance data");

      const result = await createMaintenance({
        aquariumId: id,
        type: newMaintenanceData.type,
        description: newMaintenanceData.description,
        performedAt: date,
      });

      if (result.success && result.data) {
        // Добавляем новое обслуживание в локальное состояние
        const newMaintenanceItem: MaintenanceData = {
          id: result.data.id,
          performedAt: new Date(result.data.performedAt),
          status: "PENDING", // Новые записи всегда имеют статус PENDING
          type: newMaintenanceData.type, // Используем данные из формы
          description: result.data.description,
          WaterLog: [],
        };

        setMaintenanceData((prev) => [...prev, newMaintenanceItem]);
        setSelectedDate(null);
        setShowStartDateInfo(false);
        setClickedDate(null);
      } else {
        console.error("Failed to create maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error adding maintenance:", error);
    }
  };

  const { openModal } = useMaintenanceEditStore();

  const handleEditMaintenance = (maintenance: MaintenanceData) => {
    openModal(maintenance, handleSaveEdit);
  };

  const handleSaveEdit = async (editData: any) => {
    if (!selectedMaintenance || editData.type.length === 0) {
      return;
    }

    // Проверяем, можно ли устанавливать выбранный статус
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(selectedMaintenance.performedAt);
    maintenanceDate.setHours(0, 0, 0, 0);
    const isToday = maintenanceDate.getTime() === today.getTime();

    // Валидация статусов в зависимости от даты и исходного статуса
    const isFuture = maintenanceDate > today;

    if (isToday && selectedMaintenance.status === "PENDING") {
      // Для сегодняшних записей со статусом PENDING разрешены все статусы
      // Валидация не нужна
    } else if (isFuture) {
      // Для будущих записей разрешены только PENDING и CANCELLED
      if (editData.status !== "PENDING" && editData.status !== "CANCELLED") {
        console.error(
          "For future records, only PENDING or CANCELLED status is allowed"
        );
        return;
      }
    } else if (
      !isToday &&
      !isFuture &&
      selectedMaintenance.status === "SKIPPED"
    ) {
      // Для старых записей со статусом SKIPPED разрешены только COMPLETED и CANCELLED
      if (editData.status !== "COMPLETED" && editData.status !== "CANCELLED") {
        console.error(
          "For old SKIPPED records, only COMPLETED or CANCELLED status is allowed"
        );
        return;
      }
    } else {
      // Для остальных случаев разрешены только PENDING и CANCELLED
      if (editData.status !== "PENDING" && editData.status !== "CANCELLED") {
        console.error(
          "Only PENDING or CANCELLED status is allowed for this record"
        );
        return;
      }
    }

    try {
      const result = await updateMaintenance({
        maintenanceId: selectedMaintenance.id,
        aquariumId: id,
        type: editData.type,
        description: editData.description,
        status: editData.status,
      });

      if (result.success && result.data) {
        // Обновляем локальное состояние
        setMaintenanceData((prev) =>
          prev.map((item) =>
            item.id === selectedMaintenance.id
              ? {
                  ...item,
                  type: editData.type,
                  description: editData.description,
                  status: editData.status,
                }
              : item
          )
        );

        // Обновляем selectedMaintenance с новыми данными
        setSelectedMaintenance((prev) =>
          prev
            ? {
                ...prev,
                type: editData.type,
                description: editData.description,
                status: editData.status,
              }
            : null
        );

        setShowStartDateInfo(false);
        setSelectedDate(null);
      } else {
        console.error("Failed to update maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error updating maintenance:", error);
    }
  };

  const handleCompleteWithParams = async (waterParameters: any) => {
    if (!selectedMaintenance) return;

    console.log("Completing maintenance with params:", waterParameters);

    try {
      const result = await updateMaintenance({
        maintenanceId: selectedMaintenance.id,
        aquariumId: id,
        status: "COMPLETED",
        waterParameters,
      });

      console.log("Update result:", result);

      if (result.success && result.data) {
        // Если сервер не вернул WaterLog, загружаем обновленные данные
        if (!(result.data as any).WaterLog) {
          console.log(
            "Server didn't return WaterLog, fetching updated data..."
          );
          try {
            const updatedMaintenanceResult = await fetchMaintenanceData(id);
            console.log(
              "Updated maintenance result:",
              updatedMaintenanceResult
            );
            if (
              updatedMaintenanceResult.success &&
              updatedMaintenanceResult.data
            ) {
              const updatedItem = updatedMaintenanceResult.data.find(
                (item: any) => item.id === selectedMaintenance.id
              );

              console.log("Found updated item:", updatedItem);

              if (updatedItem) {
                // Обновляем локальное состояние с обновленными данными
                setMaintenanceData((prev) =>
                  prev.map((item) =>
                    item.id === selectedMaintenance.id
                      ? {
                          ...item,
                          status: "COMPLETED",
                          WaterLog: updatedItem.WaterLog || [],
                        }
                      : item
                  )
                );

                // Обновляем selectedMaintenance с обновленными данными
                setSelectedMaintenance((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: "COMPLETED",
                        WaterLog: updatedItem.WaterLog || [],
                      }
                    : null
                );
              }
            }
          } catch (fetchError) {
            console.error(
              "Error fetching updated maintenance data:",
              fetchError
            );
          }
        } else {
          // Если сервер вернул WaterLog, используем его
          console.log(
            "Server returned WaterLog:",
            (result.data as any).WaterLog
          );
          setMaintenanceData((prev) =>
            prev.map((item) =>
              item.id === selectedMaintenance.id
                ? {
                    ...item,
                    status: "COMPLETED",
                    WaterLog: (result.data as any).WaterLog || [],
                  }
                : item
            )
          );

          setSelectedMaintenance((prev) =>
            prev
              ? {
                  ...prev,
                  status: "COMPLETED",
                  WaterLog: (result.data as any).WaterLog || [],
                }
              : null
          );
        }

        // Модальное окно закрывается автоматически через стор
        setShowStartDateInfo(false);
        setSelectedDate(null);
        setClickedDate(null);
      } else {
        console.error("Failed to complete maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error completing maintenance:", error);
    }
  };

  const handleCompleteWithoutParams = async () => {
    if (!selectedMaintenance) return;

    try {
      const result = await updateMaintenance({
        maintenanceId: selectedMaintenance.id,
        aquariumId: id,
        status: "COMPLETED",
      });

      if (result.success && result.data) {
        // Обновляем локальное состояние
        setMaintenanceData((prev) =>
          prev.map((item) =>
            item.id === selectedMaintenance.id
              ? { ...item, status: "COMPLETED" }
              : item
          )
        );

        // Обновляем selectedMaintenance с новым статусом
        setSelectedMaintenance((prev) =>
          prev
            ? {
                ...prev,
                status: "COMPLETED",
              }
            : null
        );

        setShowStartDateInfo(false);
        setSelectedDate(null);
      } else {
        console.error("Failed to complete maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error completing maintenance:", error);
    }
  };

  const canEditMaintenance = (maintenance: MaintenanceData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(maintenance.performedAt);
    maintenanceDate.setHours(0, 0, 0, 0);
    const isToday = maintenanceDate.getTime() === today.getTime();
    const isFuture = maintenanceDate > today;

    // Нельзя редактировать записи со статусом COMPLETED
    if (maintenance.status === "COMPLETED") {
      return false;
    }

    // Для сегодняшних записей можно редактировать записи со статусом PENDING
    if (isToday) {
      return maintenance.status === "PENDING";
    }

    // Для будущих записей можно редактировать любые записи (кроме COMPLETED)
    if (isFuture) {
      return true;
    }

    // Для старых дат можно редактировать только записи со статусом SKIPPED
    return maintenance.status === "SKIPPED";
  };

  const canCompleteMaintenance = (maintenance: MaintenanceData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(maintenance.performedAt);
    maintenanceDate.setHours(0, 0, 0, 0);

    // Кнопка "Завершить" доступна для всех сегодняшних записей со статусом PENDING
    return (
      maintenance.status === "PENDING" &&
      maintenanceDate.getTime() === today.getTime()
    );
  };

  const hasParameterCheck = (maintenance: MaintenanceData) => {
    return maintenance.type.includes("PARAMETER_CHECK");
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-16 border border-gray-200"></div>
      );
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const maintenanceForDay = getMaintenanceForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isFuture = date >= new Date(new Date().setHours(0, 0, 0, 0));
      const hasMaintenance = maintenanceForDay.length > 0;
      const isAquariumStartDate = isStartDate(date);
      const isClickedDate =
        clickedDate && clickedDate.toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.2,
            delay: day * 0.01,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.1 },
          }}
          whileTap={{ scale: 0.98 }}
          className={`h-16 border border-gray-200 p-1 relative cursor-pointer transition-colors ${
            isToday ? "bg-blue-100" : ""
          } ${isFuture && !hasMaintenance ? "hover:bg-green-50" : ""} ${
            isAquariumStartDate ? "border-2 border-purple-500 bg-purple-50" : ""
          } ${isClickedDate ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          <div
            className={`text-xs font-medium mb-1 ${
              isAquariumStartDate ? "text-purple-700 font-bold" : ""
            }`}
          >
            {day}
            {isAquariumStartDate && (
              <div className="text-xs text-purple-600 mt-1">🚀</div>
            )}
          </div>
          <div className="space-y-0.5">
            {maintenanceForDay.map((maintenance) => (
              <div
                key={maintenance.id}
                className={`w-2 h-2 rounded-full mx-auto ${getStatusColor(
                  maintenance.status,
                  date
                )}`}
                title={`${maintenance.description} - ${maintenance.status}`}
              />
            ))}
            {isFuture && !hasMaintenance && (
              <div className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-3 h-3 inline" />
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleRefreshStatuses = async () => {
    try {
      console.log("Starting refresh of old pending maintenance...");

      // Обновляем старые PENDING записи на SKIPPED
      const updateResult = await updateOldPendingMaintenance(id);
      console.log("Update result:", updateResult);

      if (updateResult.success) {
        console.log(
          `Updated ${updateResult.updatedCount} old pending records to SKIPPED`
        );

        // Перезагружаем данные обслуживания
        const maintenanceResult = await fetchMaintenanceData(id);
        if (maintenanceResult.success && maintenanceResult.data) {
          const formattedData = maintenanceResult.data.map((item: any) => ({
            id: item.id,
            performedAt: new Date(item.performedAt),
            status: item.status,
            type: item.type,
            description: item.description,
            WaterLog: item.WaterLog,
          }));
          setMaintenanceData(formattedData);
          console.log("Maintenance data refreshed successfully");
        }
      } else {
        console.error(
          "Failed to update old pending maintenance:",
          updateResult.error
        );
      }
    } catch (error) {
      console.error("Error refreshing statuses:", error);
    }
  };

  const monthNames = [
    tDetails("months.january"),
    tDetails("months.february"),
    tDetails("months.march"),
    tDetails("months.april"),
    tDetails("months.may"),
    tDetails("months.june"),
    tDetails("months.july"),
    tDetails("months.august"),
    tDetails("months.september"),
    tDetails("months.october"),
    tDetails("months.november"),
    tDetails("months.december"),
  ];

  return (
    <>
      <motion.div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
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
          {aquarium ? (
            <span className="relative group transition-all duration-700 text-nowrap">
              <Link
                href={"../" + id}
                className="relative z-10 after:content-[''] after:absolute after:bottom-0 after:right-0 after:left-0 after:h-[3px] after:bg-current after:scale-x-0 after:origin-right after:transition-transform after:duration-500 group-hover:after:scale-x-100"
              >
                {aquarium.name}
              </Link>
              <span className="text-nowrap"> &nbsp; | &nbsp;</span>
            </span>
          ) : (
            <div className="inline-block h-6 sm:h-8 w-32 sm:w-40 rounded bg-muted animate-pulse" />
          )}

          {aquarium ? (
            <span className="text-wrap">{tDetails("maintenanceCalendar")}</span>
          ) : (
            <div className="inline-block h-6 sm:h-8 w-32 sm:w-40 rounded bg-muted animate-pulse" />
          )}
        </motion.h2>
      </motion.div>
      {isLoading ? (
        <LoadingBlock translate={t("loading")} />
      ) : (
        <div className="flex w-full flex-wrap justify-between">
          <div className="mb-6 lg:w-[48%] w-full">
            <motion.div
              className="flex flex-wrap gap-2 my-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">{tDetails("pending")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">{tDetails("completed")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-3 h-3 border-2 border-red-500 rounded-full"></div>
                <span className="text-sm">{tDetails("skipped")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <span className="text-sm">{tDetails("cancelled")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-3 h-3 border-2 border-purple-500 bg-purple-50 rounded"></div>
                <span className="text-sm">{tDetails("startDateLegend")}</span>
              </motion.div>
            </motion.div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </span>
                  <div className="flex gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshStatuses}
                        title={tDetails("refreshStatuses")}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {/* Weekday Headers */}
                  {[
                    tDetails("weekdays.monday"),
                    tDetails("weekdays.tuesday"),
                    tDetails("weekdays.wednesday"),
                    tDetails("weekdays.thursday"),
                    tDetails("weekdays.friday"),
                    tDetails("weekdays.saturday"),
                    tDetails("weekdays.sunday"),
                  ].map((day) => (
                    <div
                      key={day}
                      className="h-8 flex items-center justify-center font-medium text-sm "
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar */}
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Information Block */}
          <AnimatePresence>
            {selectedMaintenance && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="my-6 lg:w-[48%] w-full"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{tDetails("maintenanceInfo")}</span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMaintenance(null);
                            setShowStartDateInfo(false);
                            setSelectedDate(null);
                            setClickedDate(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs uppercase tracking-widest mb-1 font-semibold">
                          {tDetails("date")}
                        </Label>
                        <p>
                          {selectedMaintenance.performedAt.toLocaleDateString(
                            "ru-RU"
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs uppercase tracking-widest mb-1 font-semibold">
                          {tDetails("maintenanceType")}
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedMaintenance.type.map((type) => (
                            <span
                              key={type}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                            >
                              {getMaintenanceTypeLabel(type)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs uppercase tracking-widest mb-1 font-semibold">
                          {tDetails("status")}
                        </Label>
                        <div
                          className={`flex px-2 py-1 rounded text-xs w-fit text-white ${
                            selectedMaintenance.status === "PENDING"
                              ? "bg-green-500"
                              : selectedMaintenance.status === "COMPLETED"
                              ? "bg-yellow-500"
                              : selectedMaintenance.status === "SKIPPED"
                              ? "bg-red-500"
                              : "bg-black"
                          }`}
                        >
                          {selectedMaintenance.status === "PENDING"
                            ? tDetails("pending")
                            : selectedMaintenance.status === "COMPLETED"
                            ? tDetails("completed")
                            : selectedMaintenance.status === "SKIPPED"
                            ? tDetails("skipped")
                            : tDetails("cancelled")}
                        </div>
                      </div>

                      {selectedMaintenance.description && (
                        <div>
                          <Label className="text-xs uppercase tracking-widest mb-1 font-semibold">
                            {tDetails("description")}
                          </Label>
                          <p>{selectedMaintenance.description}</p>
                        </div>
                      )}

                      {selectedMaintenance.WaterLog &&
                        selectedMaintenance.WaterLog.length > 0 && (
                          <div>
                            <Label className="text-xs uppercase tracking-widest mb-1 font-semibold">
                              {tDetails("waterParameters")}
                            </Label>
                            <div className="text-xs text-gray-500 mb-2">
                              Debug: {selectedMaintenance.WaterLog.length}{" "}
                              {tDetails("parameters")}
                            </div>
                            <WaterParametersCards
                              parameters={selectedMaintenance.WaterLog}
                              showDate={true}
                              temperatureScale={temperatureScale}
                            />
                          </div>
                        )}

                      <div className="flex gap-2 pt-4">
                        {canEditMaintenance(selectedMaintenance) && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={() =>
                                handleEditMaintenance(selectedMaintenance)
                              }
                              variant="outline"
                            >
                              {tDetails("edit")}
                            </Button>
                          </motion.div>
                        )}

                        {canCompleteMaintenance(selectedMaintenance) && (
                          <>
                            {hasParameterCheck(selectedMaintenance) ? (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={() =>
                                    openWaterParamsModal(
                                      handleCompleteWithParams,
                                      tDetails("waterParamsTitle")
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {tDetails("completeWithParams")}
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={handleCompleteWithoutParams}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {tDetails("complete")}
                                </Button>
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aquarium Start Date Information Block */}
          <AnimatePresence>
            {showStartDateInfo && selectedDate && aquarium?.startDate && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="my-6 lg:w-[48%] w-full"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        🚀 {tDetails("aquariumStartDate")}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowStartDateInfo(false);
                            setSelectedDate(null);
                            setSelectedMaintenance(null);
                            setClickedDate(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">
                          {tDetails("startDateLabel")}
                        </Label>
                        <p className="text-purple-700 font-semibold">
                          {new Date(aquarium.startDate).toLocaleDateString(
                            "ru-RU"
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium">
                          {tDetails("aquariumName")}
                        </Label>
                        <p>{aquarium.name}</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-800">
                          {tDetails("startDateMessage")} аквариум &ldquo;
                          {aquarium.name}&ldquo;.{" "}
                          {tDetails("startDateMessageEnd")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
