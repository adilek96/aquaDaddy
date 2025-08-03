"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaTimes } from "react-icons/fa";

import { measurCalcGal } from "@/components/helpers/mesurCalcGal";
import { ZodErrors } from "../helpers/ZodErrors";

interface AquariumEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  aquarium: any;
  onSave: (data: any) => void;
  section: string;
}

// Модальное окно для редактирования описания
export function DescriptionEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isOpen && aquarium) {
      setDescription(aquarium.description || "");
    }
  }, [isOpen, aquarium]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ description });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editDescription")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования спецификаций
export function SpecificationsEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
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
    if (isOpen && aquarium) {
      // Конвертируем значения в текущую систему измерения для отображения
      const convertFromMetric = (value: number | null) => {
        if (!value) return "";
        if (currentMeasurementSystem === "imperial") {
          return (value / 2.54).toFixed(1); // сантиметры в дюймы
        }
        return value.toString();
      };

      const convertVolumeFromMetric = (value: number | null) => {
        if (!value) return "";
        if (currentMeasurementSystem === "imperial") {
          return (value / 3.78541).toFixed(1); // литры в галлоны
        }
        return value.toString();
      };

      setSpecifications({
        lengthCm: convertFromMetric(aquarium.lengthCm),
        widthCm: convertFromMetric(aquarium.widthCm),
        heightCm: convertFromMetric(aquarium.heightCm),
        diameterCm: convertFromMetric(aquarium.diameterCm),
        sideCm: convertFromMetric(aquarium.sideCm),
        depthCm: convertFromMetric(aquarium.depthCm),
        volumeLiters: convertVolumeFromMetric(aquarium.volumeLiters),
        k: aquarium.k?.toString() || "0.9",
      });
    }
  }, [isOpen, aquarium, currentMeasurementSystem]);

  // Автоматически пересчитываем объем при изменении системы измерения
  useEffect(() => {
    if (aquarium?.shape && isOpen && autoCalculateVolume) {
      // Небольшая задержка для корректного обновления состояния
      setTimeout(() => {
        updateVolume(aquarium.shape, specifications);
      }, 100);
    }
  }, [
    currentMeasurementSystem,
    aquarium?.shape,
    aquarium?.type,
    isOpen,
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
    const aquariumType = aquarium?.type;
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
      if (aquarium?.shape && autoCalculateVolume) {
        setTimeout(() => updateVolume(aquarium.shape, newSpecs), 100);
      }

      return newSpecs;
    });
  };

  const handleSave = async () => {
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
      await onSave(numericSpecifications);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const renderFieldsByShape = () => {
    const shape = aquarium?.shape;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editSpecifications")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
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
          {aquarium?.type === "PALUDARIUM" && (
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

          {aquarium?.type === "FRESHWATER" && (
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

          {aquarium?.type === "SALTWATER" && (
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
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования обитателей
export function InhabitantsEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [inhabitants, setInhabitants] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && aquarium) {
      if (aquarium.inhabitants && aquarium.inhabitants.length > 0) {
        setInhabitants(
          aquarium.inhabitants
            .map(
              (inhabitant: any) => `${inhabitant.species} (${inhabitant.count})`
            )
            .join(", ")
        );
      } else {
        setInhabitants("");
      }
    }
  }, [isOpen, aquarium]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ inhabitants });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editInhabitants")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="inhabitants">{t("inhabitants")}</Label>
            <Textarea
              id="inhabitants"
              value={inhabitants}
              onChange={(e) => setInhabitants(e.target.value)}
              placeholder={t("inhabitantsPlaceholder")}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Формат: &ldquo;Вид рыбы (количество), Вид растения
              (количество)&rdquo;
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования параметров воды
export function WaterParamsEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [params, setParams] = useState({
    pH: "",
    temperatureC: "",
    KH: "",
    GH: "",
    NH3: "",
    NH4: "",
    NO2: "",
    NO3: "",
    PO4: "",
    K: "",
    Fe: "",
    Mg: "",
    Ca: "",
    salinity: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  // Состояние для шкалы температуры
  const [temperatureScale, setTemperatureScale] = useState<
    "celsius" | "fahrenheit"
  >("celsius");

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

  useEffect(() => {
    if (isOpen && aquarium) {
      const wp = aquarium.waterParams || {};
      let temperatureValue = wp.temperatureC?.toString() || "";

      // Если выбраны фаренгейты, конвертируем для отображения
      if (
        temperatureScale === "fahrenheit" &&
        temperatureValue &&
        !isNaN(Number(temperatureValue))
      ) {
        const celsius = Number(temperatureValue);
        const fahrenheit = (celsius * 9) / 5 + 32;
        temperatureValue = fahrenheit.toFixed(1);
      }

      setParams({
        pH: wp.pH?.toString() || "",
        temperatureC: temperatureValue,
        KH: wp.KH?.toString() || "",
        GH: wp.GH?.toString() || "",
        NH3: wp.NH3?.toString() || "",
        NH4: wp.NH4?.toString() || "",
        NO2: wp.NO2?.toString() || "",
        NO3: wp.NO3?.toString() || "",
        PO4: wp.PO4?.toString() || "",
        K: wp.K?.toString() || "",
        Fe: wp.Fe?.toString() || "",
        Mg: wp.Mg?.toString() || "",
        Ca: wp.Ca?.toString() || "",
        salinity: wp.salinity?.toString() || "",
      });
    }
  }, [isOpen, aquarium, temperatureScale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Преобразуем строки в числа или null
      const waterParameters: Record<string, number | null> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (
          key === "temperatureC" &&
          temperatureScale === "fahrenheit" &&
          value !== ""
        ) {
          // Если выбраны фаренгейты, конвертируем обратно в цельсии перед сохранением
          const fahrenheit = parseFloat(value);
          const celsius = ((fahrenheit - 32) * 5) / 9;
          waterParameters[key] = celsius;
        } else {
          waterParameters[key] = value === "" ? null : parseFloat(value);
        }
      });
      await onSave({ waterParameters });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editWaterParams")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pH">pH</Label>
              <Input
                name="pH"
                id="pH"
                value={params.pH}
                onChange={handleChange}
                placeholder="7.2"
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="temperatureC">
                {t("temperature")} (
                {temperatureScale === "fahrenheit" ? "°F" : "°C"})
              </Label>
              <Input
                name="temperatureC"
                id="temperatureC"
                value={params.temperatureC}
                onChange={handleChange}
                placeholder={temperatureScale === "fahrenheit" ? "77" : "25"}
                type="number"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="KH">KH</Label>
              <Input
                name="KH"
                id="KH"
                value={params.KH}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="GH">GH</Label>
              <Input
                name="GH"
                id="GH"
                value={params.GH}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="NH3">NH3</Label>
              <Input
                name="NH3"
                id="NH3"
                value={params.NH3}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="NH4">NH4</Label>
              <Input
                name="NH4"
                id="NH4"
                value={params.NH4}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="NO2">NO2</Label>
              <Input
                name="NO2"
                id="NO2"
                value={params.NO2}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="NO3">NO3</Label>
              <Input
                name="NO3"
                id="NO3"
                value={params.NO3}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="PO4">PO4</Label>
              <Input
                name="PO4"
                id="PO4"
                value={params.PO4}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="K">K</Label>
              <Input
                name="K"
                id="K"
                value={params.K}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="Fe">Fe</Label>
              <Input
                name="Fe"
                id="Fe"
                value={params.Fe}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="Mg">Mg</Label>
              <Input
                name="Mg"
                id="Mg"
                value={params.Mg}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="Ca">Ca</Label>
              <Input
                name="Ca"
                id="Ca"
                value={params.Ca}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="salinity">{t("salinity")}</Label>
              <Input
                name="salinity"
                id="salinity"
                value={params.salinity}
                onChange={handleChange}
                placeholder=""
                type="number"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования напоминаний
export function RemindersEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [reminders, setReminders] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && aquarium) {
      if (aquarium.reminders && aquarium.reminders.length > 0) {
        setReminders(
          aquarium.reminders
            .map(
              (reminder: any) =>
                `${reminder.title} (${new Date(
                  reminder.remindAt
                ).toLocaleDateString()})`
            )
            .join(", ")
        );
      } else {
        setReminders("");
      }
    }
  }, [isOpen, aquarium]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ reminders });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editReminders")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reminders">{t("reminders")}</Label>
            <Textarea
              id="reminders"
              value={reminders}
              onChange={(e) => setReminders(e.target.value)}
              placeholder={t("remindersPlaceholder")}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Напоминания о техническом обслуживании
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования временной шкалы
export function TimelineEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isOpen && aquarium) {
      let dateStr = "";
      if (aquarium.startDate) {
        if (typeof aquarium.startDate === "string") {
          dateStr = aquarium.startDate.split("T")[0];
        } else if (aquarium.startDate instanceof Date) {
          dateStr = aquarium.startDate.toISOString().split("T")[0];
        }
      }
      setStartDate(dateStr);
    }
  }, [isOpen, aquarium]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({ startDate });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editTimeline")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="startDate">{tDetails("startDate")}</Label>
            <Input
              id="startDate"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}

// Модальное окно для редактирования обзора
export function OverviewEditModal({
  isOpen,
  onClose,
  aquarium,
  onSave,
  section,
}: AquariumEditModalProps) {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [overview, setOverview] = useState({
    type: "",
    shape: "",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isOpen && aquarium) {
      setOverview({
        type: aquarium.type || "",
        shape: aquarium.shape || "",
        isPublic: aquarium.isPublic || false,
      });
    }
  }, [isOpen, aquarium]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(overview);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bebas uppercase tracking-wide">
            {tDetails("editOverview")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="type">{t("type")}</Label>
            <Select
              value={overview.type}
              onValueChange={(value) =>
                setOverview((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRESHWATER">{t("freshwater")}</SelectItem>
                <SelectItem value="SALTWATER">{t("saltwater")}</SelectItem>
                <SelectItem value="PALUDARIUM">{t("paludarium")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="shape">{t("shape")}</Label>
            <Select
              value={overview.shape}
              onValueChange={(value) =>
                setOverview((prev) => ({ ...prev, shape: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("shapePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangular">{t("rectangular")}</SelectItem>
                <SelectItem value="cube">{t("cube")}</SelectItem>
                <SelectItem value="bow">{t("bow")}</SelectItem>
                <SelectItem value="hexagon">{t("hexagon")}</SelectItem>
                <SelectItem value="cylinder">{t("cylinder")}</SelectItem>
                <SelectItem value="sphere">{t("sphere")}</SelectItem>
                <SelectItem value="hemisphere">{t("hemisphere")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={overview.isPublic}
              onChange={(e) =>
                setOverview((prev) => ({ ...prev, isPublic: e.target.checked }))
              }
              className="rounded"
            />
            <Label htmlFor="isPublic">{tDetails("public")}</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
      </div>
    </div>
  );
}
