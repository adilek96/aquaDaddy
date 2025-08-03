"use client";
import { aquariumAddingAction } from "@/app/actions/aquariumAddingAction";
import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
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
import { useRouter } from "next/navigation";

const INITIAL_STATE = {
  data: null,
  zodErrors: null,
  message: null,
  success: false,
  aquariumId: undefined,
  aquariumName: undefined,
};

export default function AquariumAddingForm() {
  const t = useTranslations("AquariumForm");
  const router = useRouter();
  const [currentMeasurementSystem, setCurrentMeasurementSystem] =
    useState<string>("metric");
  const [formState, formAction] = useFormState(
    aquariumAddingAction,
    INITIAL_STATE
  );

  // Состояния для размеров
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [isVolumeManuallyChanged, setIsVolumeManuallyChanged] =
    useState<boolean>(false);

  // Новые состояния для разных форм
  const [shape, setShape] = useState<string>("rectangular");
  const [diameter, setDiameter] = useState<string>("");
  const [radius, setRadius] = useState<string>("");
  const [side, setSide] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  const [k, setK] = useState<string>("0.9"); // коэффициент для выпуклого

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
    system: string,
    shape: string,
    values: {
      length?: number;
      width?: number;
      height?: number;
      diameter?: number;
      radius?: number;
      side?: number;
      depth?: number;
      k?: number;
    }
  ): number => {
    // Преобразование в см, если imperial
    const toCm = (val: number) => (system === "imperial" ? val * 2.54 : val);

    let volumeInLiters = 0;

    switch (shape) {
      case "rectangular": {
        const l = toCm(values.length ?? 0);
        const w = toCm(values.width ?? 0);
        const h = toCm(values.height ?? 0);
        volumeInLiters = (l * w * h) / 1000; // литры
        break;
      }
      case "cube": {
        const l = toCm(values.length ?? 0);
        const h = toCm(values.height ?? 0);
        volumeInLiters = (l * l * h) / 1000; // литры
        break;
      }
      case "cylinder": {
        const d = toCm(values.diameter ?? 0);
        const h = toCm(values.height ?? 0);
        const r = d / 2;
        volumeInLiters = (Math.PI * r * r * h) / 1000;
        break;
      }
      case "sphere": {
        const d = toCm(values.diameter ?? 0);
        const r = d / 2;
        volumeInLiters = ((4 / 3) * Math.PI * Math.pow(r, 3)) / 1000;
        break;
      }
      case "hemisphere": {
        const d = toCm(values.diameter ?? 0);
        const r = d / 2;
        volumeInLiters = ((2 / 3) * Math.PI * Math.pow(r, 3)) / 1000;
        break;
      }
      case "hexagon": {
        const a = toCm(values.side ?? 0);
        const h = toCm(values.height ?? 0);
        const S = ((3 * Math.sqrt(3)) / 2) * a * a;
        volumeInLiters = (S * h) / 1000;
        break;
      }
      case "bow": {
        const w = toCm(values.width ?? 0);
        const h = toCm(values.height ?? 0);
        const d = toCm(values.depth ?? 0);
        const k = values.k ?? 0.9;
        volumeInLiters = (w * h * d * k) / 1000;
        break;
      }
      default:
        return 0;
    }

    // Конвертируем в галлоны, если система имперская
    if (system === "imperial") {
      return volumeInLiters / 3.78541; // Конвертируем литры в галлоны
    }

    return volumeInLiters; // Возвращаем литры для метрической системы
  };

  // Автоматический расчет объема при изменении размеров или формы
  useEffect(() => {
    if (isVolumeManuallyChanged) return;
    let v = 0;
    switch (shape) {
      case "rectangular":
        if (length && width && height) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            length: parseFloat(length),
            width: parseFloat(width),
            height: parseFloat(height),
          });
        }
        break;
      case "cube":
        if (length && height) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            length: parseFloat(length),
            height: parseFloat(height),
          });
        }
        break;
      case "cylinder":
        if (diameter && height) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            diameter: parseFloat(diameter),
            height: parseFloat(height),
          });
        }
        break;
      case "sphere":
        if (diameter) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            diameter: parseFloat(diameter),
          });
        }
        break;
      case "hemisphere":
        if (diameter) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            diameter: parseFloat(diameter),
          });
        }
        break;
      case "hexagon":
        if (side && height) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            side: parseFloat(side),
            height: parseFloat(height),
          });
        }
        break;
      case "bow":
        if (width && height && depth && k) {
          v = calculateVolume(currentMeasurementSystem, shape, {
            width: parseFloat(width),
            height: parseFloat(height),
            depth: parseFloat(depth),
            k: parseFloat(k),
          });
        }
        break;
      default:
        break;
    }
    if (v > 0) setVolume(v.toFixed(1));
  }, [
    length,
    width,
    height,
    diameter,
    side,
    depth,
    k,
    shape,
    currentMeasurementSystem,
    isVolumeManuallyChanged,
  ]);

  // Сброс флага ручного изменения при изменении системы измерения
  useEffect(() => {
    setIsVolumeManuallyChanged(false);
  }, [currentMeasurementSystem]);

  // Обработка успешного добавления аквариума
  useEffect(() => {
    if (formState.success && formState.aquariumId && formState.aquariumName) {
      // Редиректим на страницу со списком аквариумов с параметрами для модального окна
      router.push(
        `/myTanks?success=true&id=${
          formState.aquariumId
        }&name=${encodeURIComponent(formState.aquariumName)}`
      );
    }
  }, [formState.success, formState.aquariumId, formState.aquariumName, router]);

  // Обработчики изменения полей (добавляю новые)
  const handleShapeChange = (value: string) => {
    setShape(value);
    setIsVolumeManuallyChanged(false);
    // Сбросить все поля размеров при смене формы
    setLength("");
    setWidth("");
    setHeight("");
    setDiameter("");
    setRadius("");
    setSide("");
    setDepth("");
    setK("0.9");
    setVolume("");
  };
  const handleDiameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiameter(e.target.value);
  };
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(e.target.value);
  };
  const handleSideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSide(e.target.value);
  };
  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepth(e.target.value);
  };
  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setK(e.target.value);
  };
  // ВОССТАНАВЛИВАЮ ОБРАБОТЧИКИ ДЛЯ ОСНОВНЫХ ПОЛЕЙ
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
    <motion.form
      className="flex flex-col gap-4 my-10 md:mx-10"
      action={handleFormAction}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex flex-row flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div
          className="space-y-2 w-full md:w-1/2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Label htmlFor="name">{t("tankName")}</Label>
          <Input
            id="name"
            name="name"
            placeholder={t("tankNamePlaceholder")}
            required
            className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
          />
          <ZodErrors error={formState?.zodErrors?.name || []} />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
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
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Label htmlFor="shape">{t("shape")}</Label>
          <Select
            name="shape"
            required
            value={shape}
            onValueChange={handleShapeChange}
          >
            <SelectTrigger className="w-full">
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
          <ZodErrors error={formState?.zodErrors?.shape || []} />
        </motion.div>
      </motion.div>
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
        />
        <ZodErrors error={formState?.zodErrors?.description || []} />
      </motion.div>

      <motion.div
        className="space-y-2 w-full md:w-1/4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Label htmlFor="startDate">{t("startDate")}</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          placeholder={t("startDatePlaceholder")}
          className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5 w-[230px]"
        />
        <ZodErrors error={formState?.zodErrors?.startDate || []} />
      </motion.div>

      <motion.div
        className="flex flex-row flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {shape === "cylinder" && (
          <motion.div
            className="grid grid-cols-2 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="space-y-2">
              <Label htmlFor="diameterCm">
                {t("diameter")}
                {getLengthUnit()}
              </Label>
              <Input
                id="diameterCm"
                name="diameterCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "10" : "25"
                }
                value={diameter}
                onChange={handleDiameterChange}
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.diameterCm || []} />
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
          </motion.div>
        )}

        {shape === "sphere" && (
          <div className="space-y-2">
            <Label htmlFor="diameterCm">
              {t("diameter")}
              {getLengthUnit()}
            </Label>
            <Input
              id="diameterCm"
              name="diameterCm"
              type="number"
              step="0.1"
              placeholder={
                currentMeasurementSystem === "imperial" ? "10" : "25"
              }
              value={diameter}
              onChange={handleDiameterChange}
              className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
            />
            <ZodErrors error={formState?.zodErrors?.diameterCm || []} />
          </div>
        )}

        {shape === "hemisphere" && (
          <div className="space-y-2">
            <Label htmlFor="diameterCm">
              {t("diameter")}
              {getLengthUnit()}
            </Label>
            <Input
              id="diameterCm"
              name="diameterCm"
              type="number"
              step="0.1"
              placeholder={
                currentMeasurementSystem === "imperial" ? "10" : "25"
              }
              value={diameter}
              onChange={handleDiameterChange}
              className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
            />
            <ZodErrors error={formState?.zodErrors?.diameterCm || []} />
          </div>
        )}

        {shape === "hexagon" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="sideCm">
                {t("side")}
                {getLengthUnit()}
              </Label>
              <Input
                id="sideCm"
                name="sideCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "10" : "25"
                }
                value={side}
                onChange={handleSideChange}
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.sideCm || []} />
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
          </div>
        )}

        {shape === "bow" && (
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depthCm">
                {t("depth")}
                {getLengthUnit()}
              </Label>
              <Input
                id="depthCm"
                name="depthCm"
                type="number"
                step="0.1"
                placeholder={
                  currentMeasurementSystem === "imperial" ? "10" : "25"
                }
                value={depth}
                onChange={handleDepthChange}
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.depthCm || []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k">{t("bowK")}</Label>
              <Input
                id="k"
                name="k"
                type="number"
                step="0.1"
                placeholder="0.9"
                value={k}
                onChange={handleKChange}
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.k || []} />
            </div>
          </div>
        )}

        {/* Прямоугольный и куб */}
        {shape === "rectangular" && (
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
          </div>
        )}

        {shape === "cube" && (
          <div className="grid grid-cols-2 gap-2">
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
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.lengthCm || []} />
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
                  currentMeasurementSystem === "imperial" ? "24" : "60"
                }
                value={height}
                onChange={handleHeightChange}
                className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
              />
              <ZodErrors error={formState?.zodErrors?.heightCm || []} />
            </div>
          </div>
        )}

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
            placeholder={currentMeasurementSystem === "imperial" ? "17" : "63"}
            value={volume}
            onChange={handleVolumeChange}
            className="md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
          />
          <ZodErrors error={formState?.zodErrors?.volumeLiters || []} />
        </div>
      </motion.div>
      <motion.div
        className="flex w-full flex-col mt-5 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
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
          className="w-full md:w-1/2 mx-auto md:h-12 md:text-lg md:p-4 lg:h-14 lg:text-xl lg:p-5"
          text={t("addButton")}
          loadingText={t("addingButton")}
        />
      </motion.div>
    </motion.form>
  );
}
