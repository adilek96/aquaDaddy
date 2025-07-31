"use client";
import React from "react";
import { useTranslations } from "next-intl";
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
import { X } from "lucide-react";
import { useMaintenanceAddStore } from "@/store/maintenanceAddStore";

const maintenanceTypes = [
  { value: "WATER_CHANGE", label: "maintenanceTypes.WATER_CHANGE" },
  { value: "GRAVEL_CLEANING", label: "maintenanceTypes.GRAVEL_CLEANING" },
  { value: "GLASS_CLEANING", label: "maintenanceTypes.GLASS_CLEANING" },
  { value: "FILTER_CLEANING", label: "maintenanceTypes.FILTER_CLEANING" },
  { value: "PARAMETER_CHECK", label: "maintenanceTypes.PARAMETER_CHECK" },
  { value: "PLANT_CARE", label: "maintenanceTypes.PLANT_CARE" },
  { value: "CORAL_CARE", label: "maintenanceTypes.CORAL_CARE" },
  { value: "SUPPLEMENTS", label: "maintenanceTypes.SUPPLEMENTS" },
  { value: "ALGAE_CONTROL", label: "maintenanceTypes.ALGAE_CONTROL" },
  { value: "OTHER", label: "maintenanceTypes.OTHER" },
];

export default function MaintenanceAddModal() {
  const tDetails = useTranslations("AquariumDetails");
  const {
    isOpen,
    selectedDate,
    newMaintenance,
    onSave,
    closeModal,
    updateNewMaintenance,
  } = useMaintenanceAddStore();

  // Предотвращаем скрытие скроллбара
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (onSave && newMaintenance.type.length > 0 && selectedDate) {
      await onSave(newMaintenance, selectedDate);
      closeModal();
    }
  };

  const handleClose = () => {
    closeModal();
  };

  if (!isOpen || !selectedDate) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("addMaintenance")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{tDetails("date")}</Label>
            <Input value={selectedDate.toLocaleDateString("ru-RU")} disabled />
          </div>

          <div>
            <Label>{tDetails("maintenanceType")}</Label>
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
                  updateNewMaintenance({
                    type: [...newMaintenance.type, typedValue],
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={tDetails("selectMaintenanceType")} />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {maintenanceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {tDetails(type.label)}
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
                    {tDetails(
                      maintenanceTypes.find((t) => t.value === type)?.label ||
                        ""
                    )}
                    <button
                      onClick={() =>
                        updateNewMaintenance({
                          type: newMaintenance.type.filter((t) => t !== type),
                        })
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
            <Label>{tDetails("description")}</Label>
            <Textarea
              value={newMaintenance.description}
              onChange={(e) =>
                updateNewMaintenance({
                  description: e.target.value,
                })
              }
              placeholder={tDetails("descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={newMaintenance.type.length === 0}
              className="flex-1"
            >
              {tDetails("add")}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {tDetails("cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
