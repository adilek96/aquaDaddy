"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";

export default function AquariumInhabitantsModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [inhabitants, setInhabitants] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isInhabitantsModalOpen,
    selectedAquarium,
    onSaveInhabitants,
    closeInhabitantsModal,
  } = useAquariumEditStore();

  useEffect(() => {
    if (isInhabitantsModalOpen && selectedAquarium) {
      if (
        selectedAquarium.inhabitants &&
        selectedAquarium.inhabitants.length > 0
      ) {
        setInhabitants(
          selectedAquarium.inhabitants
            .map(
              (inhabitant: any) => `${inhabitant.species} (${inhabitant.count})`
            )
            .join(", ")
        );
      } else {
        setInhabitants("");
      }
    }
  }, [isInhabitantsModalOpen, selectedAquarium]);

  const handleSave = async () => {
    if (!onSaveInhabitants) return;

    setIsLoading(true);
    try {
      await onSaveInhabitants({ inhabitants });
      closeInhabitantsModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeInhabitantsModal();
  };

  if (!isInhabitantsModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isInhabitantsModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  dark:bg-black/50  backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editInhabitants")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="inhabitants">{t("inhabitants")}</Label>
            <Textarea
              id="inhabitants"
              value={inhabitants}
              onChange={(e) => setInhabitants(e.target.value)}
              placeholder={t("inhabitantsPlaceholder")}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("inhabitantsFormat")}
            </p>
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
