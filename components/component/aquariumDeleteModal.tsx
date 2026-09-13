"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, AlertTriangle } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { useRouter } from "next/navigation";
import { useModalDismiss } from "@/lib/useModalDismiss";

export default function AquariumDeleteModal() {
  const t = useTranslations("AquariumDetails");
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isDeleteModalOpen,
    selectedAquarium,
    onDeleteAquarium,
    closeDeleteModal,
  } = useAquariumEditStore();

  // Проверяем, совпадает ли введенное имя с именем аквариума
  const isNameMatch = selectedAquarium && confirmName === selectedAquarium.name;
  const isConfirmButtonDisabled = !isNameMatch || isLoading;

  const handleDelete = async () => {
    if (!onDeleteAquarium || !selectedAquarium || !isNameMatch) return;

    setIsLoading(true);
    try {
      await onDeleteAquarium(selectedAquarium.id);
      closeDeleteModal();
      // Перенаправляем на страницу списка аквариумов
      router.push("/myTanks");
    } catch (error) {
      console.error("Error deleting aquarium:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeDeleteModal();
    setConfirmName("");
  };

  // Escape закрывает окно, фон под ним не прокручивается
  useModalDismiss(isDeleteModalOpen, handleClose);

  // Очищаем поле при открытии/закрытии модального окна
  useEffect(() => {
    if (!isDeleteModalOpen) {
      setConfirmName("");
    }
  }, [isDeleteModalOpen]);

  if (!isDeleteModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-modal overflow-y-auto overscroll-contain bg-scrim/60 p-4 backdrop-blur-sm ${
        isDeleteModalOpen ? "flex" : "hidden"
      } items-start justify-center sm:items-center`}
      style={{ overflow: "visible" }}
    >
      <Card className="surface-panel-raised my-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("deleteAquariumTitle")}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-destructive/10 border border-destructive/25 rounded-lg">
              <p className="text-sm font-medium text-destructive">
                {t("deleteAquariumWarning")}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("deleteAquariumDescription", { name: selectedAquarium.name })}
            </p>

            <div className="space-y-2">
              <Label htmlFor="confirmName" className="text-sm font-medium">
                {t("deleteAquariumConfirm")}
              </Label>
              <Input
                id="confirmName"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={t("deleteAquariumPlaceholder")}
                className={`${
                  confirmName && !isNameMatch
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              {confirmName && !isNameMatch && (
                <p className="text-xs text-destructive">
                  {t("deleteAquariumNameMismatch")}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("deleteAquariumCancelButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isConfirmButtonDisabled}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {t("deleteAquariumDeleting")}
                </div>
              ) : (
                t("deleteAquariumConfirmButton")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
