"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps, useEffect, useState } from "react";

export default function MeasurementToggle() {
  const [currentSystem, setCurrentSystem] = useState<string>("metric");

  useEffect(() => {
    // Загружаем сохраненную систему измерения из localStorage
    const savedSystem = localStorage.getItem("measurement_system");
    if (savedSystem) {
      setCurrentSystem(savedSystem);
    }
  }, []);

  const setMeasurementSystem = (system: string) => {
    localStorage.setItem("measurement_system", system);
    setCurrentSystem(system);
    // Можно добавить обновление страницы или уведомление других компонентов
    window.dispatchEvent(
      new CustomEvent("measurementSystemChanged", { detail: system })
    );
  };

  // Функция для отображения текущей иконки
  const getCurrentIcon = () => {
    if (currentSystem === "imperial") {
      return <ImperialIcon className="w-5 h-5 text-muted-foreground" />;
    }
    return <MetricIcon className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="flex  items-center ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-md ">
            {getCurrentIcon()}
            <span className="sr-only">Select measurement system</span>
          </Button>
        </DropdownMenuTrigger>
        <div className=" backdrop-blur-3xl ">
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="bg-secondary/40"
          >
            <DropdownMenuItem onClick={() => setMeasurementSystem("metric")}>
              <MetricIcon className="w-5 h-5" />
              <span>Metric (cm/L)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMeasurementSystem("imperial")}>
              <ImperialIcon className="w-5 h-5" />
              <span>Imperial (in/gal)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}

function MetricIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <div className="relative">
      <svg
        className="w-6 h-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1v3a1 1 0 1 1-2 0v-3h-1v3a1 1 0 1 1-2 0v-3h-1v3a1 1 0 1 1-2 0v-3H7a1 1 0 1 1 0-2h3v-1H7a1 1 0 1 1 0-2h3V8H7a1 1 0 0 1 0-2h3V5a2 2 0 0 0-2-2H5Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="absolute -top-1 -right-1 text-xs font-bold text-blue-600 dark:text-blue-400">
        EU
      </span>
    </div>
  );
}

function ImperialIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <div className="relative">
      <svg
        className="w-6 h-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1v3a1 1 0 1 1-2 0v-3h-1v3a1 1 0 1 1-2 0v-3h-1v3a1 1 0 1 1-2 0v-3H7a1 1 0 1 1 0-2h3v-1H7a1 1 0 1 1 0-2h3V8H7a1 1 0 0 1 0-2h3V5a2 2 0 0 0-2-2H5Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="absolute -top-1 -right-1 text-xs font-bold text-red-600 dark:text-red-400">
        US
      </span>
    </div>
  );
}
