"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";

export default function AquariumTimelineModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isTimelineModalOpen,
    selectedAquarium,
    onSaveTimeline,
    closeTimelineModal,
  } = useAquariumEditStore();

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isTimelineModalOpen && selectedAquarium) {
      let dateStr = "";
      if (selectedAquarium.startDate) {
        if (typeof selectedAquarium.startDate === "string") {
          dateStr = selectedAquarium.startDate.split("T")[0];
        } else if (selectedAquarium.startDate instanceof Date) {
          dateStr = selectedAquarium.startDate.toISOString().split("T")[0];
        }
      }
      setStartDate(dateStr);
    }
  }, [isTimelineModalOpen, selectedAquarium]);

  const handleSave = async () => {
    if (!onSaveTimeline) return;

    setIsLoading(true);
    try {
      await onSaveTimeline({ startDate });
      closeTimelineModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeTimelineModal();
  };

  if (!isTimelineModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isTimelineModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  dark:bg-black/50  backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editTimeline")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
