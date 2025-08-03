"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { measurCalcGal } from "@/components/helpers/mesurCalcGal";

export default function AquariumSpecificationsModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [currentMeasurementSystem, setCurrentMeasurementSystem] =
    useState<string>("metric");
  const [specifications, setSpecifications] = useState({
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    diameterCm: "",
    sideCm: "",
    depthCm: "",
    volumeLiters: "",
    k: "0.9",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoCalculateVolume, setAutoCalculateVolume] = useState(true);

  const {
    isSpecificationsModalOpen,
    selectedAquarium,
    onSaveSpecifications,
    closeSpecificationsModal,
  } = useAquariumEditStore();

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

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isSpecificationsModalOpen && selectedAquarium) {
      // Конвертируем значения в текущую систему измерения для отображения
      const convertFromMetric = (value: number | null | undefined) => {
        if (!value) return "";
        if (currentMeasurementSystem === "imperial") {
          return (value / 2.54).toFixed(1); // сантиметры в дюймы
        }
        return value.toString();
      };

      const convertVolumeFromMetric = (value: number | null | undefined) => {
        if (!value) return "";
        if (currentMeasurementSystem === "imperial") {
          return (value / 3.78541).toFixed(1); // литры в галлоны
        }
        return value.toString();
      };

      setSpecifications({
        lengthCm: convertFromMetric(selectedAquarium.lengthCm),
        widthCm: convertFromMetric(selectedAquarium.widthCm),
        heightCm: convertFromMetric(selectedAquarium.heightCm),
        diameterCm: convertFromMetric(selectedAquarium.diameterCm),
        sideCm: convertFromMetric(selectedAquarium.sideCm),
        depthCm: convertFromMetric(selectedAquarium.depthCm),
        volumeLiters: convertVolumeFromMetric(selectedAquarium.volumeLiters),
        k: selectedAquarium.k?.toString() || "0.9",
      });
    }
  }, [isSpecificationsModalOpen, selectedAquarium, currentMeasurementSystem]);

  // Автоматически пересчитываем объем при изменении системы измерения
  useEffect(() => {
    if (
      selectedAquarium?.shape &&
      isSpecificationsModalOpen &&
      autoCalculateVolume
    ) {
      // Небольшая задержка для корректного обновления состояния
      setTimeout(() => {
        if (selectedAquarium.shape) {
          updateVolume(selectedAquarium.shape, specifications);
        }
      }, 100);
    }
  }, [
    currentMeasurementSystem,
    selectedAquarium?.shape,
    selectedAquarium?.type,
    isSpecificationsModalOpen,
    autoCalculateVolume,
  ]);

  const getLengthUnit = () =>
    currentMeasurementSystem === "imperial" ? " (in)" : " (cm)";
  const getVolumeUnit = () =>
    currentMeasurementSystem === "imperial" ? " (gal)" : " (L)";

  // Функции для расчета объема в зависимости от формы аквариума
  const calculateVolume = (shape: string, specs: any) => {
    // Получаем значения в сантиметрах (основная единица измерения)
    let length = parseFloat(specs.lengthCm) || 0;
    let width = parseFloat(specs.widthCm) || 0;
    let height = parseFloat(specs.heightCm) || 0;
    let diameter = parseFloat(specs.diameterCm) || 0;
    let depth = parseFloat(specs.depthCm) || 0;
    const k = parseFloat(specs.k) || 0.9;

    // Если используется имперская система, конвертируем дюймы в сантиметры
    if (currentMeasurementSystem === "imperial") {
      length = length * 2.54;
      width = width * 2.54;
      height = height * 2.54;
      diameter = diameter * 2.54;
      depth = depth * 2.54;
    }

    let volumeInLiters = 0;

    switch (shape) {
      case "rectangular":
        volumeInLiters = (length * width * height) / 1000; // см³ в литры
        break;

      case "cube":
        volumeInLiters = Math.pow(length, 3) / 1000; // см³ в литры
        break;

      case "cylinder":
        const radius = diameter / 2;
        volumeInLiters = (Math.PI * Math.pow(radius, 2) * height) / 1000; // см³ в литры
        break;

      case "sphere":
        const sphereRadius = diameter / 2;
        volumeInLiters = ((4 / 3) * Math.PI * Math.pow(sphereRadius, 3)) / 1000; // см³ в литры
        break;

      case "bow":
        // Для bow-аквариума используем формулу с коэффициентом k
        volumeInLiters = (width * height * depth * k) / 1000; // см³ в литры
        break;

      case "hexagon":
        // Для шестигранного аквариума: площадь шестигранника * высота
        const side = parseFloat(specs.sideCm) || 0;
        const sideInCm =
          currentMeasurementSystem === "imperial" ? side * 2.54 : side;
        const hexArea = (3 * Math.sqrt(3) * Math.pow(sideInCm, 2)) / 2;
        volumeInLiters = (hexArea * height) / 1000;
        break;

      case "hemisphere":
        const hemisphereRadius = diameter / 2;
        volumeInLiters =
          ((2 / 3) * Math.PI * Math.pow(hemisphereRadius, 3)) / 1000; // см³ в литры
        break;

      default:
        volumeInLiters = (length * width * height) / 1000; // По умолчанию прямоугольная форма
    }

    // Применяем коэффициент в зависимости от типа аквариума
    const aquariumType = selectedAquarium?.type;
    if (aquariumType === "PALUDARIUM") {
      // Для палюдариума учитываем, что часть объема занята сушей
      volumeInLiters *= 0.7;
    }

    return volumeInLiters;
  };

  // Функция для обновления объема при изменении размеров
  const updateVolume = (shape: string, specs: any) => {
    const volumeInLiters = calculateVolume(shape, specs);
    if (volumeInLiters > 0) {
      let displayVolume = volumeInLiters;

      // Если используется имперская система, конвертируем в галлоны
      if (currentMeasurementSystem === "imperial") {
        displayVolume = measurCalcGal(volumeInLiters, "imperial");
      }

      setSpecifications((prev) => ({
        ...prev,
        volumeLiters: displayVolume.toFixed(1),
      }));
    }
  };

  // Функция для обработки изменения размеров с автоматическим расчетом объема
  const handleDimensionChange = (field: string, value: string) => {
    setSpecifications((prev) => {
      const newSpecs = { ...prev, [field]: value };

      // Автоматически рассчитываем объем при изменении размеров только если включена опция
      if (selectedAquarium?.shape && autoCalculateVolume) {
        setTimeout(() => updateVolume(selectedAquarium.shape!, newSpecs), 100);
      }

      return newSpecs;
    });
  };

  const handleSave = async () => {
    if (!onSaveSpecifications) return;

    setIsLoading(true);
    try {
      // Конвертируем значения обратно в метрическую систему перед сохранением
      const convertToMetric = (value: string) => {
        if (!value) return null;
        const numValue = parseFloat(value);
        if (currentMeasurementSystem === "imperial") {
          return numValue * 2.54; // дюймы в сантиметры
        }
        return numValue;
      };

      const convertVolumeToMetric = (value: string) => {
        if (!value) return null;
        const numValue = parseFloat(value);
        if (currentMeasurementSystem === "imperial") {
          return numValue * 3.78541; // галлоны в литры
        }
        return numValue;
      };

      // Преобразуем строковые значения в числа для Prisma
      const numericSpecifications = {
        lengthCm: convertToMetric(specifications.lengthCm),
        widthCm: convertToMetric(specifications.widthCm),
        heightCm: convertToMetric(specifications.heightCm),
        diameterCm: convertToMetric(specifications.diameterCm),
        sideCm: convertToMetric(specifications.sideCm),
        depthCm: convertToMetric(specifications.depthCm),
        volumeLiters: convertVolumeToMetric(specifications.volumeLiters),
        k: specifications.k ? parseFloat(specifications.k) : 0.9,
      };
      await onSaveSpecifications(numericSpecifications);
      closeSpecificationsModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeSpecificationsModal();
  };

  const renderFieldsByShape = () => {
    const shape = selectedAquarium?.shape;

    switch (shape) {
      case "rectangular":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lengthCm">
                {t("length")}
                {getLengthUnit()}
              </Label>
              <Input
                id="lengthCm"
                type="number"
                step="0.1"
                value={specifications.lengthCm}
                onChange={(e) =>
                  handleDimensionChange("lengthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="widthCm">
                {t("width")}
                {getLengthUnit()}
              </Label>
              <Input
                id="widthCm"
                type="number"
                step="0.1"
                value={specifications.widthCm}
                onChange={(e) =>
                  handleDimensionChange("widthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      case "cube":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lengthCm">
                {t("length")}
                {getLengthUnit()}
              </Label>
              <Input
                id="lengthCm"
                type="number"
                step="0.1"
                value={specifications.lengthCm}
                onChange={(e) =>
                  handleDimensionChange("lengthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      case "cylinder":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diameterCm">
                {t("diameter")}
                {getLengthUnit()}
              </Label>
              <Input
                id="diameterCm"
                type="number"
                step="0.1"
                value={specifications.diameterCm}
                onChange={(e) =>
                  handleDimensionChange("diameterCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      case "sphere":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diameterCm">
                {t("diameter")}
                {getLengthUnit()}
              </Label>
              <Input
                id="diameterCm"
                type="number"
                step="0.1"
                value={specifications.diameterCm}
                onChange={(e) =>
                  handleDimensionChange("diameterCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? "Рассчитывается автоматически"
                  : "Введите объем вручную"}
              </p>
            </div>
          </div>
        );

      case "bow":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="widthCm">
                {t("width")}
                {getLengthUnit()}
              </Label>
              <Input
                id="widthCm"
                type="number"
                step="0.1"
                value={specifications.widthCm}
                onChange={(e) =>
                  handleDimensionChange("widthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="depthCm">
                {t("depth")}
                {getLengthUnit()}
              </Label>
              <Input
                id="depthCm"
                type="number"
                step="0.1"
                value={specifications.depthCm}
                onChange={(e) =>
                  handleDimensionChange("depthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="k">{t("bowK")}</Label>
              <Input
                id="k"
                type="number"
                step="0.1"
                value={specifications.k}
                onChange={(e) => handleDimensionChange("k", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      case "hexagon":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sideCm">
                {t("side")}
                {getLengthUnit()}
              </Label>
              <Input
                id="sideCm"
                type="number"
                step="0.1"
                value={specifications.sideCm}
                onChange={(e) =>
                  handleDimensionChange("sideCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      case "hemisphere":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diameterCm">
                {t("diameter")}
                {getLengthUnit()}
              </Label>
              <Input
                id="diameterCm"
                type="number"
                step="0.1"
                value={specifications.diameterCm}
                onChange={(e) =>
                  handleDimensionChange("diameterCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lengthCm">
                {t("length")}
                {getLengthUnit()}
              </Label>
              <Input
                id="lengthCm"
                type="number"
                step="0.1"
                value={specifications.lengthCm}
                onChange={(e) =>
                  handleDimensionChange("lengthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="widthCm">
                {t("width")}
                {getLengthUnit()}
              </Label>
              <Input
                id="widthCm"
                type="number"
                step="0.1"
                value={specifications.widthCm}
                onChange={(e) =>
                  handleDimensionChange("widthCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                value={specifications.heightCm}
                onChange={(e) =>
                  handleDimensionChange("heightCm", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volumeLiters">
                {t("volume")}
                {getVolumeUnit()}
              </Label>
              <Input
                id="volumeLiters"
                type="number"
                step="0.1"
                value={specifications.volumeLiters}
                onChange={(e) =>
                  setSpecifications((prev) => ({
                    ...prev,
                    volumeLiters: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly={autoCalculateVolume}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {autoCalculateVolume
                  ? t("volumeCalcAuto")
                  : t("volumeCalcInfoManual")}
              </p>
            </div>
          </div>
        );
    }
  };

  if (!isSpecificationsModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isSpecificationsModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  dark:bg-black/50  backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editSpecifications")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="autoCalculateVolume"
              checked={autoCalculateVolume}
              onChange={(e) => setAutoCalculateVolume(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="autoCalculateVolume">
              {t("automatedCalculation")}
            </Label>
          </div>

          {/* Информационные надписи для разных типов аквариумов */}
          {selectedAquarium?.type === "PALUDARIUM" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{t("volumeInfoPaludariumBold")}</strong>
                <br />
                {t("volumeInfoPaludarium")}
                <br />
                <br />
                <em>{t("volumeCalcInfo")}</em>
              </p>
            </div>
          )}

          {selectedAquarium?.type === "FRESHWATER" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{t("volumeInfoFreshwaterBold")}</strong>
                <br />
                {t("volumeInfoFreshwater")}
                <br />
                <br />
                <em>{t("volumeCalcInfo")}</em>
              </p>
            </div>
          )}

          {selectedAquarium?.type === "SALTWATER" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>{t("volumeInfoSaltBold")}</strong>
                <br />
                {t("volumeInfoSalt")}
                <br />
                <br />
                <em>{t("volumeCalcInfo")}</em>
              </p>
            </div>
          )}

          {renderFieldsByShape()}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {t("saving")}
                </div>
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
