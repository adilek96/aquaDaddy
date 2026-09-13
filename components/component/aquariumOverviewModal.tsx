"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { useModalDismiss } from "@/lib/useModalDismiss";

export default function AquariumOverviewModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [overview, setOverview] = useState({
    type: "",
    shape: "",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOverviewModalOpen,
    selectedAquarium,
    onSaveOverview,
    closeOverviewModal,
  } = useAquariumEditStore();

  // Обновляем состояние при изменении aquarium или открытии модального окна
  useEffect(() => {
    if (isOverviewModalOpen && selectedAquarium) {
      setOverview({
        type: selectedAquarium.type || "",
        shape: selectedAquarium.shape || "",
        isPublic: selectedAquarium.isPublic || false,
      });
    }
  }, [isOverviewModalOpen, selectedAquarium]);

  const handleSave = async () => {
    if (!onSaveOverview) return;

    setIsLoading(true);
    try {
      await onSaveOverview(overview);
      closeOverviewModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeOverviewModal();
  };

  // Escape закрывает окно, фон под ним не прокручивается
  useModalDismiss(isOverviewModalOpen, handleClose);

  if (!isOverviewModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-modal overflow-y-auto overscroll-contain bg-scrim/60 p-4 backdrop-blur-sm ${
        isOverviewModalOpen ? "flex" : "hidden"
      } items-start justify-center sm:items-center`}
      style={{ overflow: "visible" }}
    >
      <Card className="surface-panel-raised my-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editOverview")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
