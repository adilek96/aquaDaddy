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
      className={`w-full h-full ${
        isDeleteModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5 dark:bg-black/50 backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t("deleteAquariumTitle")}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
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
                <p className="text-xs text-red-500">
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
