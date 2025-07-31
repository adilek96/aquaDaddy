"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WaterParameters {
  pH?: number | null;
  temperatureC?: number | null;
  KH?: number | null;
  GH?: number | null;
  NH3?: number | null;
  NH4?: number | null;
  NO2?: number | null;
  NO3?: number | null;
  PO4?: number | null;
  K?: number | null;
  Fe?: number | null;
  Mg?: number | null;
  Ca?: number | null;
  salinity?: number | null;
}

interface WaterParametersFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: WaterParameters) => Promise<void>;
  initialParams?: WaterParameters;
  title?: string;
}

export function WaterParametersForm({
  isOpen,
  onClose,
  onSave,
  initialParams,
  title = "Параметры воды"
}: WaterParametersFormProps) {
  const t = useTranslations("AquariumForm");
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
  const [temperatureScale, setTemperatureScale] = useState<"celsius" | "fahrenheit">("celsius");

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
    window.addEventListener("temperatureScaleChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("temperatureScaleChanged", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isOpen && initialParams) {
      let temperatureValue = initialParams.temperatureC?.toString() || "";

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
        pH: initialParams.pH?.toString() || "",
        temperatureC: temperatureValue,
        KH: initialParams.KH?.toString() || "",
        GH: initialParams.GH?.toString() || "",
        NH3: initialParams.NH3?.toString() || "",
        NH4: initialParams.NH4?.toString() || "",
        NO2: initialParams.NO2?.toString() || "",
        NO3: initialParams.NO3?.toString() || "",
        PO4: initialParams.PO4?.toString() || "",
        K: initialParams.K?.toString() || "",
        Fe: initialParams.Fe?.toString() || "",
        Mg: initialParams.Mg?.toString() || "",
        Ca: initialParams.Ca?.toString() || "",
        salinity: initialParams.salinity?.toString() || "",
      });
    }
  }, [isOpen, initialParams, temperatureScale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Преобразуем строки в числа или null
      const waterParameters: WaterParameters = {};
      Object.entries(params).forEach(([key, value]) => {
        if (
          key === "temperatureC" &&
          temperatureScale === "fahrenheit" &&
          value !== ""
        ) {
          // Если выбраны фаренгейты, конвертируем обратно в цельсии перед сохранением
          const fahrenheit = parseFloat(value);
          const celsius = ((fahrenheit - 32) * 5) / 9;
          waterParameters[key as keyof WaterParameters] = celsius;
        } else {
          waterParameters[key as keyof WaterParameters] = value === "" ? null : parseFloat(value);
        }
      });
      await onSave(waterParameters);
      onClose();
    } catch (error) {
      console.error("Error saving water parameters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {t("temperature")} ({temperatureScale === "fahrenheit" ? "°F" : "°C"})
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
              <Label htmlFor="salinity">Соленость</Label>
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
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 