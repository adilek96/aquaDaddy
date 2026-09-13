"use client";
import React from "react";
import {
  Atom,
  Circle,
  Droplet,
  FlaskConical,
  Leaf,
  Thermometer,
  Waves,
} from "lucide-react";

interface WaterParameter {
  id?: string;
  aquariumId?: string;
  maintenanceId?: string;
  recordedAt?: string;
  pH?: number;
  temperatureC?: number;
  KH?: number;
  GH?: number;
  NH3?: number;
  NH4?: number;
  NO2?: number;
  NO3?: number;
  PO4?: number;
  K?: number;
  Fe?: number;
  Mg?: number;
  Ca?: number;
  salinity?: number;
  [key: string]: any;
}

interface WaterParametersCardsProps {
  parameters: WaterParameter | WaterParameter[];
  showDate?: boolean;
  className?: string;
  temperatureScale?: "celsius" | "fahrenheit";
}

const WaterParameterCard = ({
  parameter,
  showDate = true,
  temperatureScale = "celsius",
}: {
  parameter: WaterParameter;
  showDate?: boolean;
  temperatureScale?: "celsius" | "fahrenheit";
}) => {
  const getParameterConfig = (key: string, value: any) => {
    let label = key;
    let icon: React.ReactNode;
    let displayValue = String(value);

    // Всегда используем иконки из react-icons/fa для единообразия
    switch (key) {
      case "pH":
        label = "pH";
        icon = <Droplet className="text-primary w-5 h-5" />;
        break;
      case "temperatureC":
        if (temperatureScale === "fahrenheit") {
          displayValue = `${((Number(value) * 9) / 5 + 32).toFixed(1)}°F`;
          label = "Температура (°F)";
        } else {
          displayValue = `${value}°C`;
          label = "Температура (°C)";
        }
        icon = <Thermometer className="text-destructive w-5 h-5" />;
        break;
      case "KH":
        label = "KH";
        icon = <Atom className="text-warning w-5 h-5" />;
        break;
      case "GH":
        label = "GH";
        icon = <Atom className="text-warning w-5 h-5" />;
        break;
      case "NH3":
        label = "NH3";
        icon = <FlaskConical className="text-success w-5 h-5" />;
        break;
      case "NH4":
        label = "NH4";
        icon = <FlaskConical className="text-success w-5 h-5" />;
        break;
      case "NO2":
        label = "NO2";
        icon = <FlaskConical className="text-purple-500 w-5 h-5" />;
        break;
      case "NO3":
        label = "NO3";
        icon = <FlaskConical className="text-purple-700 w-5 h-5" />;
        break;
      case "PO4":
        label = "PO4";
        icon = <FlaskConical className="text-pink-500 w-5 h-5" />;
        break;
      case "K":
        label = "K";
        icon = <Leaf className="text-success w-5 h-5" />;
        break;
      case "Fe":
        label = "Fe";
        icon = <Circle className="text-orange-500 w-5 h-5" />;
        break;
      case "Mg":
        label = "Mg";
        icon = <Circle className="text-secondary w-5 h-5" />;
        break;
      case "Ca":
        label = "Ca";
        icon = <Circle className="text-muted-foreground w-5 h-5" />;
        break;
      case "salinity":
        label = "Соленость";
        icon = <Waves className="text-cyan-500 w-5 h-5" />;
        break;
      default:
        label = key;
        icon = <FlaskConical className="text-muted-foreground w-5 h-5" />;
    }

    return { label, icon, displayValue };
  };

  const validParameters = Object.entries(parameter).filter(
    ([key, value]) =>
      key !== "id" &&
      key !== "aquariumId" &&
      key !== "maintenanceId" &&
      key !== "recordedAt" &&
      key !== "lastUpdated" &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  if (validParameters.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-center text-muted-foreground">
          Нет данных о параметрах воды
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {validParameters.map(([key, value]) => {
          const { label, icon, displayValue } = getParameterConfig(key, value);

          return (
            <div
              key={key}
              className="flex flex-col items-center justify-center bg-card hover:border-primary/40 border border-gray-200 rounded-xl shadow-sm p-3 min-w-0 transition-colors"
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
      {showDate && parameter.recordedAt && (
        <div className="text-xs text-muted-foreground mt-3 pt-2 border-t border-bory-200">
          <strong>Записано: </strong>
          {new Date(parameter.recordedAt).toLocaleDateString("ru-RU")}
        </div>
      )}
    </div>
  );
};

export default function WaterParametersCards({
  parameters,
  showDate = true,
  className = "",
  temperatureScale = "celsius",
}: WaterParametersCardsProps) {
  const parametersArray = Array.isArray(parameters) ? parameters : [parameters];

  if (parametersArray.length === 0) {
    return (
      <div className={`rounded-lg border border-border bg-muted/50 p-4 ${className}`}>
        <p className="text-center text-muted-foreground">
          Нет данных о параметрах воды
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {parametersArray.map((parameter, index) => (
        <WaterParameterCard
          key={parameter.id || index}
          parameter={parameter}
          showDate={showDate}
          temperatureScale={temperatureScale}
        />
      ))}
    </div>
  );
}
