"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { fetchUserAquarium } from "@/app/actions/aquariumFetch";
import {
  fetchMaintenanceData,
  createMaintenance,
  updateMaintenance,
  updateOldPendingMaintenance,
} from "@/app/actions/maintenanceFetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { WaterParametersForm } from "@/components/component/waterParametersForm";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWaterParamsModal, setShowWaterParamsModal] = useState(false);
  const [showStartDateInfo, setShowStartDateInfo] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    type: [] as (
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
    )[],
    description: "",
  });
  const [editMaintenance, setEditMaintenance] = useState({
    type: [] as (
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
    )[],
    description: "",
    status: "PENDING" as "PENDING" | "COMPLETED" | "CANCELLED" | "SKIPPED",
  });

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
      WATER_CHANGE: "Смена воды",
      GRAVEL_CLEANING: "Сифонка грунта",
      GLASS_CLEANING: "Чистка стёкол",
      FILTER_CLEANING: "Обслуживание фильтра",
      PARAMETER_CHECK: "Проверка параметров воды",
      PLANT_CARE: "Уход за растениями",
      CORAL_CARE: "Уход за кораллами",
      SUPPLEMENTS: "Добавление питательных веществ",
      ALGAE_CONTROL: "Удаление водорослей",
      OTHER: "Другое",
    };
    return typeLabels[type] || type;
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    // Проверяем, есть ли обслуживание на эту дату
    const maintenanceForDay = getMaintenanceForDate(date);

    if (maintenanceForDay.length > 0) {
      // Если есть обслуживание, показываем информацию о первом
      setSelectedMaintenance(maintenanceForDay[0]);
    } else if (clickedDate >= today) {
      // Если нет обслуживания и дата будущая, показываем форму добавления
      setSelectedDate(date);
      setShowAddModal(true);
    } else if (isStartDate(date)) {
      // Если это дата запуска аквариума, показываем специальную информацию
      setSelectedDate(date);
      setShowStartDateInfo(true);
    }
  };

  const handleAddMaintenance = async () => {
    if (!selectedDate || newMaintenance.type.length === 0) {
      return;
    }

    try {
      console.log("Sending maintenance data:", {
        aquariumId: id,
        type: newMaintenance.type,
        description: newMaintenance.description,
        performedAt: selectedDate,
      });

      const result = await createMaintenance({
        aquariumId: id,
        type: newMaintenance.type,
        description: newMaintenance.description,
        performedAt: selectedDate,
      });

      if (result.success && result.data) {
        // Добавляем новое обслуживание в локальное состояние
        const newMaintenanceItem: MaintenanceData = {
          id: result.data.id,
          performedAt: new Date(result.data.performedAt),
          status: "PENDING", // Новые записи всегда имеют статус PENDING
          type: newMaintenance.type, // Используем данные из формы
          description: result.data.description,
          WaterLog: [],
        };

        setMaintenanceData((prev) => [...prev, newMaintenanceItem]);
        setShowAddModal(false);
        setSelectedDate(null);
        setNewMaintenance({ type: [], description: "" });
      } else {
        console.error("Failed to create maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error adding maintenance:", error);
    }
  };

  const handleEditMaintenance = (maintenance: MaintenanceData) => {
    setSelectedMaintenance(maintenance);

    // Проверяем, можно ли использовать текущий статус для данной даты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(maintenance.performedAt);
    maintenanceDate.setHours(0, 0, 0, 0);
    const isToday = maintenanceDate.getTime() === today.getTime();
    const isFuture = maintenanceDate > today;

    // Определяем начальный статус в зависимости от даты и текущего статуса
    let initialStatus = maintenance.status;

    // Для старых записей со статусом SKIPPED оставляем как есть
    if (!isToday && !isFuture && maintenance.status === "SKIPPED") {
      initialStatus = "SKIPPED";
    }
    // Для сегодняшних записей со статусом PENDING оставляем как есть
    else if (isToday && maintenance.status === "PENDING") {
      initialStatus = "PENDING";
    }
    // Для будущих записей оставляем текущий статус как есть
    else if (isFuture) {
      initialStatus = maintenance.status;
    }
    // Для остальных случаев устанавливаем PENDING
    else {
      initialStatus = "PENDING";
    }

    setEditMaintenance({
      type: maintenance.type,
      description: maintenance.description,
      status: initialStatus,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMaintenance || editMaintenance.type.length === 0) {
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
      if (
        editMaintenance.status !== "PENDING" &&
        editMaintenance.status !== "CANCELLED"
      ) {
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
      if (
        editMaintenance.status !== "COMPLETED" &&
        editMaintenance.status !== "CANCELLED"
      ) {
        console.error(
          "For old SKIPPED records, only COMPLETED or CANCELLED status is allowed"
        );
        return;
      }
    } else {
      // Для остальных случаев разрешены только PENDING и CANCELLED
      if (
        editMaintenance.status !== "PENDING" &&
        editMaintenance.status !== "CANCELLED"
      ) {
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
        type: editMaintenance.type,
        description: editMaintenance.description,
        status: editMaintenance.status,
      });

      if (result.success && result.data) {
        // Обновляем локальное состояние
        setMaintenanceData((prev) =>
          prev.map((item) =>
            item.id === selectedMaintenance.id
              ? {
                  ...item,
                  type: editMaintenance.type,
                  description: editMaintenance.description,
                  status: editMaintenance.status,
                }
              : item
          )
        );
        setShowEditModal(false);
        setSelectedMaintenance(null);
      } else {
        console.error("Failed to update maintenance:", result.error);
      }
    } catch (error) {
      console.error("Error updating maintenance:", error);
    }
  };

  const handleCompleteWithParams = async (waterParameters: any) => {
    if (!selectedMaintenance) return;

    try {
      const result = await updateMaintenance({
        maintenanceId: selectedMaintenance.id,
        aquariumId: id,
        status: "COMPLETED",
        waterParameters,
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
        setShowWaterParamsModal(false);
        setSelectedMaintenance(null);
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
        setSelectedMaintenance(null);
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

      days.push(
        <div
          key={day}
          className={`h-16 border border-gray-200 p-1 relative cursor-pointer transition-colors ${
            isToday ? "bg-blue-100" : ""
          } ${isFuture && !hasMaintenance ? "hover:bg-green-50" : ""} ${
            isAquariumStartDate ? "border-2 border-purple-500 bg-purple-50" : ""
          }`}
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
        </div>
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
      // Обновляем старые PENDING записи на SKIPPED
      const updateResult = await updateOldPendingMaintenance(id);
      if (updateResult.success) {
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
        }
      }
    } catch (error) {
      console.error("Error refreshing statuses:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{tDetails("loading")}</div>
      </div>
    );
  }

  if (!aquarium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{tDetails("noAquarium")}</div>
      </div>
    );
  }

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const maintenanceTypes = [
    { value: "WATER_CHANGE", label: "Смена воды" },
    { value: "GRAVEL_CLEANING", label: "Сифонка грунта" },
    { value: "GLASS_CLEANING", label: "Чистка стёкол" },
    { value: "FILTER_CLEANING", label: "Обслуживание фильтра" },
    { value: "PARAMETER_CHECK", label: "Проверка параметров воды" },
    { value: "PLANT_CARE", label: "Уход за растениями" },
    { value: "CORAL_CARE", label: "Уход за кораллами" },
    { value: "SUPPLEMENTS", label: "Добавление питательных веществ" },
    { value: "ALGAE_CONTROL", label: "Удаление водорослей" },
    { value: "OTHER", label: "Другое" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/myTanks/${id}`} className="text-blue-600 hover:underline">
          {tDetails("backToAquarium")}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {tDetails("maintenanceCalendar")}: {aquarium.name}
        </h1>
        {aquarium.startDate && (
          <p className="text-sm text-gray-600 mt-1">
            Дата запуска:{" "}
            {new Date(aquarium.startDate).toLocaleDateString("ru-RU")}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatuses}
                title="Обновить статусы старых записей"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Заголовки дней недели */}
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center font-medium text-sm"
              >
                {day}
              </div>
            ))}

            {/* Календарь */}
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {/* Легенда */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{tDetails("legend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">{tDetails("pending")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">{tDetails("completed")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">{tDetails("skipped")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black rounded"></div>
              <span className="text-sm">{tDetails("cancelled")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 bg-purple-50 rounded"></div>
              <span className="text-sm">Дата запуска</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно добавления обслуживания */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Добавить обслуживание
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Дата</Label>
                <Input
                  value={selectedDate.toLocaleDateString("ru-RU")}
                  disabled
                />
              </div>

              <div>
                <Label>Тип обслуживания</Label>
                <Select
                  onValueChange={(value) => {
                    const typedValue = value as
                      | "WATER_CHANGE"
                      | "GRAVEL_CLEANING"
                      | "GLASS_CLEANING"
                      | "FILTER_CLEANING"
                      | "PARAMETER_CHECK"
                      | "PLANT_CARE"
                      | "CORAL_CARE"
                      | "SUPPLEMENTS"
                      | "ALGAE_CONTROL"
                      | "OTHER";
                    if (!newMaintenance.type.includes(typedValue)) {
                      setNewMaintenance((prev) => ({
                        ...prev,
                        type: [...prev.type, typedValue],
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип обслуживания" />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newMaintenance.type.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {newMaintenance.type.map((type) => (
                      <div
                        key={type}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {maintenanceTypes.find((t) => t.value === type)?.label}
                        <button
                          onClick={() =>
                            setNewMaintenance((prev) => ({
                              ...prev,
                              type: prev.type.filter((t) => t !== type),
                            }))
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={newMaintenance.description}
                  onChange={(e) =>
                    setNewMaintenance((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Опишите что нужно сделать..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddMaintenance}
                  disabled={newMaintenance.type.length === 0}
                  className="flex-1"
                >
                  Добавить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Блок с информацией об обслуживании */}
      {selectedMaintenance && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Информация об обслуживании</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMaintenance(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Дата:</Label>
                <p>
                  {selectedMaintenance.performedAt.toLocaleDateString("ru-RU")}
                </p>
              </div>

              <div>
                <Label className="font-medium">Тип обслуживания:</Label>
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
                <Label className="font-medium">Статус:</Label>
                <p
                  className={`inline-block px-2 py-1 rounded text-xs text-white ${
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
                    ? "Ожидает выполнения"
                    : selectedMaintenance.status === "COMPLETED"
                    ? "Выполнено"
                    : selectedMaintenance.status === "SKIPPED"
                    ? "Пропущено"
                    : "Отменено"}
                </p>
              </div>

              {selectedMaintenance.description && (
                <div>
                  <Label className="font-medium">Описание:</Label>
                  <p>{selectedMaintenance.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {canEditMaintenance(selectedMaintenance) && (
                  <Button
                    onClick={() => handleEditMaintenance(selectedMaintenance)}
                    variant="outline"
                  >
                    Редактировать
                  </Button>
                )}

                {canCompleteMaintenance(selectedMaintenance) && (
                  <>
                    {hasParameterCheck(selectedMaintenance) ? (
                      <Button
                        onClick={() => setShowWaterParamsModal(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Завершить с параметрами
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCompleteWithoutParams}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Завершить
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Блок с информацией о дате запуска */}
      {showStartDateInfo && selectedDate && aquarium?.startDate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                🚀 Дата запуска аквариума
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowStartDateInfo(false);
                  setSelectedDate(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Дата запуска:</Label>
                <p className="text-purple-700 font-semibold">
                  {new Date(aquarium.startDate).toLocaleDateString("ru-RU")}
                </p>
              </div>

              <div>
                <Label className="font-medium">Название аквариума:</Label>
                <p>{aquarium.name}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  🎉 Это знаменательная дата! В этот день был запущен ваш
                  аквариум &ldquo;{aquarium.name}&ldquo;. С этого момента
                  началась история вашего подводного мира.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно редактирования обслуживания */}
      {showEditModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Редактировать обслуживание
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Дата</Label>
                <Input
                  value={selectedMaintenance.performedAt.toLocaleDateString(
                    "ru-RU"
                  )}
                  disabled
                />
              </div>

              <div>
                <Label>Тип обслуживания</Label>
                <Select
                  onValueChange={(value) => {
                    const typedValue = value as
                      | "WATER_CHANGE"
                      | "GRAVEL_CLEANING"
                      | "GLASS_CLEANING"
                      | "FILTER_CLEANING"
                      | "PARAMETER_CHECK"
                      | "PLANT_CARE"
                      | "CORAL_CARE"
                      | "SUPPLEMENTS"
                      | "ALGAE_CONTROL"
                      | "OTHER";
                    if (!editMaintenance.type.includes(typedValue)) {
                      setEditMaintenance((prev) => ({
                        ...prev,
                        type: [...prev.type, typedValue],
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип обслуживания" />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editMaintenance.type.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {editMaintenance.type.map((type) => (
                      <div
                        key={type}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        {maintenanceTypes.find((t) => t.value === type)?.label}
                        <button
                          onClick={() =>
                            setEditMaintenance((prev) => ({
                              ...prev,
                              type: prev.type.filter((t) => t !== type),
                            }))
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={editMaintenance.description}
                  onChange={(e) =>
                    setEditMaintenance((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Опишите что нужно сделать..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Статус</Label>
                <Select
                  value={editMaintenance.status}
                  onValueChange={(value) => {
                    setEditMaintenance((prev) => ({
                      ...prev,
                      status: value as
                        | "PENDING"
                        | "COMPLETED"
                        | "CANCELLED"
                        | "SKIPPED",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Проверяем, является ли дата обслуживания сегодняшней
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maintenanceDate = new Date(
                        selectedMaintenance.performedAt
                      );
                      maintenanceDate.setHours(0, 0, 0, 0);
                      const isToday =
                        maintenanceDate.getTime() === today.getTime();
                      const isFuture = maintenanceDate > today;

                      // Для сегодняшних записей со статусом PENDING
                      if (isToday && selectedMaintenance.status === "PENDING") {
                        return (
                          <>
                            <SelectItem value="PENDING">
                              Ожидает выполнения
                            </SelectItem>
                            <SelectItem value="CANCELLED">Отменено</SelectItem>
                            <SelectItem value="COMPLETED">Выполнено</SelectItem>
                            <SelectItem value="SKIPPED">Пропущено</SelectItem>
                          </>
                        );
                      }

                      // Для будущих записей
                      if (isFuture) {
                        return (
                          <>
                            <SelectItem value="PENDING">
                              Ожидает выполнения
                            </SelectItem>
                            <SelectItem value="CANCELLED">Отменено</SelectItem>
                          </>
                        );
                      }

                      // Для старых записей со статусом SKIPPED
                      if (
                        !isToday &&
                        !isFuture &&
                        selectedMaintenance.status === "SKIPPED"
                      ) {
                        return (
                          <>
                            <SelectItem value="COMPLETED">Выполнено</SelectItem>
                            <SelectItem value="CANCELLED">Отменено</SelectItem>
                          </>
                        );
                      }

                      // Для остальных случаев
                      return (
                        <>
                          <SelectItem value="PENDING">
                            Ожидает выполнения
                          </SelectItem>
                          <SelectItem value="CANCELLED">Отменено</SelectItem>
                        </>
                      );
                    })()}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={editMaintenance.type.length === 0}
                  className="flex-1"
                >
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальное окно параметров воды */}
      <WaterParametersForm
        isOpen={showWaterParamsModal}
        onClose={() => setShowWaterParamsModal(false)}
        onSave={handleCompleteWithParams}
        title="Параметры воды при завершении обслуживания"
      />
    </div>
  );
}
