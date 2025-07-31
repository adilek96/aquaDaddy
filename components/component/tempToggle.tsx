"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useEffect, useState } from "react";
import { TbTemperatureCelsius } from "react-icons/tb";
import { TbTemperatureFahrenheit } from "react-icons/tb";

export default function TempToggle() {
  const [currentSystem, setCurrentSystem] = useState<string>("c");

  useEffect(() => {
    // Загружаем сохраненную систему измерения из localStorage
    const savedSystem = localStorage.getItem("temperature_scales");
    if (savedSystem) {
      setCurrentSystem(savedSystem);
    }
  }, []);

  const setMeasurementSystem = (system: string) => {
    localStorage.setItem("temperature_scales", system);
    setCurrentSystem(system);
    // Отправляем кастомное событие для уведомления других компонентов
    window.dispatchEvent(
      new CustomEvent("temperatureScaleChanged", { detail: system })
    );
  };

  // Функция для отображения текущей иконки
  const getCurrentIcon = () => {
    if (currentSystem === "f") {
      return <TempFIcon className="w-5 h-5 text-muted-foreground" />;
    }
    return <TempCIcon className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="flex  items-center ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-md ">
            {getCurrentIcon()}
            <span className="sr-only">Select temperature scales</span>
          </Button>
        </DropdownMenuTrigger>
        <div className=" backdrop-blur-3xl ">
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="bg-secondary/40"
          >
            <DropdownMenuItem onClick={() => setMeasurementSystem("c")}>
              <TempCIcon className="w-5 h-5" />
              <span>Celsius (°C)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMeasurementSystem("f")}>
              <TempFIcon className="w-5 h-5" />
              <span>Fahrenheit (°F)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}

function TempCIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <div className="relative">
      <TbTemperatureCelsius className="w-6 h-6" />
      {/* <span className="absolute -top-1 -right-1 text-xs font-bold text-blue-600 dark:text-blue-400">
        °C
      </span> */}
    </div>
  );
}

function TempFIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <div className="relative">
      <TbTemperatureFahrenheit className="w-6 h-6" />
      {/* <span className="absolute -top-1 -right-1 text-xs font-bold text-red-600 dark:text-red-400">
        °F
      </span> */}
    </div>
  );
}
