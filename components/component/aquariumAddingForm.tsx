"use client";
import { aquariumAddingAction } from "@/app/actions/aquariumAddingAction";
import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ZodErrors } from "../helpers/ZodErrors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { SubmitButton } from "../ui/submitButton";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
};

export default function AquariumAddingForm() {
  const t = useTranslations("AquariumForm");
  const [currentMeasurementSystem, setCurrentMeasurementSystem] =
    useState<string>("metric");
  const [formState, formAction] = useFormState(
    aquariumAddingAction,
    INITIAL_STATE
  );

  // Состояние для размеров
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [isVolumeManuallyChanged, setIsVolumeManuallyChanged] =
    useState<boolean>(false);

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

  // Функция для расчета объема
  const calculateVolume = (
    l: number,
    w: number,
    h: number,
    system: string
  ): number => {
    if (system === "imperial") {
      // Если имперская система, конвертируем дюймы в см для расчета
      const lengthCm = l * 2.54;
      const widthCm = w * 2.54;
      const heightCm = h * 2.54;
      // Объем в см³
      const volumeCm3 = lengthCm * widthCm * heightCm;
      // Конвертируем в литры (1 л = 1000 см³)
      const volumeLiters = volumeCm3 / 1000;
      // Конвертируем обратно в галлоны для отображения
      return volumeLiters / 3.78541;
    } else {
      // Метрическая система - прямой расчет в литрах
      const volumeLiters = (l * w * h) / 1000;
      return volumeLiters;
    }
  };

  // Автоматический расчет объема при изменении размеров
  useEffect(() => {
    if (!isVolumeManuallyChanged && length && width && height) {
      const lengthNum = parseFloat(length);
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);

      if (!isNaN(lengthNum) && !isNaN(widthNum) && !isNaN(heightNum)) {
        const calculatedVolume = calculateVolume(
          lengthNum,
          widthNum,
          heightNum,
          currentMeasurementSystem
        );
        setVolume(calculatedVolume.toFixed(1));
      }
    }
  }, [
    length,
    width,
    height,
    currentMeasurementSystem,
    isVolumeManuallyChanged,
  ]);

  // Сброс флага ручного изменения при изменении системы измерения
  useEffect(() => {
    setIsVolumeManuallyChanged(false);
  }, [currentMeasurementSystem]);

  // Обработчики изменения полей
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLength(e.target.value);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(e.target.value);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(e.target.value);
    setIsVolumeManuallyChanged(true);
  };

  // Функция для отправки формы с системой измерения
  const handleFormAction = (formData: FormData) => {
    formData.append("measurementSystem", currentMeasurementSystem);
    formAction(formData);
  };

  // Получаем правильные единицы измерения
  const getLengthUnit = () =>
    currentMeasurementSystem === "imperial" ? " (in)" : " (cm)";
  const getVolumeUnit = () =>
    currentMeasurementSystem === "imperial" ? " (gal)" : " (L)";

  return (
    <Card className="w-full max-w-md mx-auto bg-[#00EBFF]/5  backdrop-blur-md border border-muted z-40 mt-20 mb-10 ">
      <CardHeader className="text-center">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={handleFormAction}>
          <div className="space-y-2">
            <Label htmlFor="name">{t("tankName")}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t("tankNamePlaceholder")}
              required
            />
            <ZodErrors error={formState?.zodErrors?.name || []} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("type")}</Label>
            <Select name="type" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRESHWATER">{t("freshwater")}</SelectItem>
                <SelectItem value="SALTWATER">{t("saltwater")}</SelectItem>
                <SelectItem value="PALUDARIUM">{t("paludarium")}</SelectItem>
              </SelectContent>
            </Select>
            <ZodErrors error={formState?.zodErrors?.type || []} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shape">{t("shape")}</Label>
            <Select name="shape" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("shapePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangular">{t("rectangular")}</SelectItem>
                <SelectItem value="cube">{t("cube")}</SelectItem>
                <SelectItem value="bow">{t("bowFront")}</SelectItem>
                <SelectItem value="hexagon">{t("hexagon")}</SelectItem>
                <SelectItem value="cylinder">{t("cylinder")}</SelectItem>
              </SelectContent>
            </Select>
            <ZodErrors error={formState?.zodErrors?.shape || []} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t("descriptionPlaceholder")}
              rows={3}
            />
            <ZodErrors error={formState?.zodErrors?.description || []} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t("startDate")}</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              placeholder={t("startDatePlaceholder")}
            />
            <ZodErrors error={formState?.zodErrors?.startDate || []} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="lengthCm">
                {t("length")}
                {getLengthUnit()}
              </Label>
              <Input
                id="lengthCm"
                name="lengthCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "24" : "60"
                }
                value={length}
                onChange={handleLengthChange}
              />
              <ZodErrors error={formState?.zodErrors?.lengthCm || []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widthCm">
                {t("width")}
                {getLengthUnit()}
              </Label>
              <Input
                id="widthCm"
                name="widthCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "12" : "30"
                }
                value={width}
                onChange={handleWidthChange}
              />
              <ZodErrors error={formState?.zodErrors?.widthCm || []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">
                {t("height")}
                {getLengthUnit()}
              </Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "14" : "35"
                }
                value={height}
                onChange={handleHeightChange}
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volumeLiters">
              {t("volume")}
              {getVolumeUnit()}
            </Label>
            <Input
              id="volumeLiters"
              name="volumeLiters"
              type="number"
              step="0.1"
              placeholder={
                currentMeasurementSystem === "imperial" ? "17" : "63"
              }
              value={volume}
              onChange={handleVolumeChange}
            />
            <ZodErrors error={formState?.zodErrors?.volumeLiters || []} />
          </div>

          <CardFooter className="flex w-full flex-col mt-5 justify-center">
            {formState?.message && (
              <div
                className={`text-sm mb-2 ${
                  formState.message.includes("successfully") ||
                  formState.message.includes("успешно") ||
                  formState.message.includes("uğurla")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formState.message}
              </div>
            )}
            <SubmitButton
              className="w-full"
              text={t("addButton")}
              loadingText={t("addingButton")}
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
