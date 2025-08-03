"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";

export default function AquariumWaterParamsModal() {
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

  const {
    isWaterParamsModalOpen,
    selectedAquarium,
    onSaveWaterParams,
    closeWaterParamsModal,
  } = useAquariumEditStore();

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
    if (isWaterParamsModalOpen && selectedAquarium) {
      const wp = selectedAquarium.waterParams || {};
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
  }, [isWaterParamsModalOpen, selectedAquarium, temperatureScale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!onSaveWaterParams) return;

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
      await onSaveWaterParams({ waterParameters });
      closeWaterParamsModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeWaterParamsModal();
  };

  if (!isWaterParamsModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isWaterParamsModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700 overflow-hidden`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  dark:bg-black/50  backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editWaterParams")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
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
