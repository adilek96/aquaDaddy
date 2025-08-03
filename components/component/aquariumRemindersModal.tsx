"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAquariumEditStore } from "@/store/aquariumEditStore";

export default function AquariumRemindersModal() {
  const t = useTranslations("AquariumForm");
  const tDetails = useTranslations("AquariumDetails");
  const [reminders, setReminders] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isRemindersModalOpen,
    selectedAquarium,
    onSaveReminders,
    closeRemindersModal,
  } = useAquariumEditStore();

  useEffect(() => {
    if (isRemindersModalOpen && selectedAquarium) {
      if (selectedAquarium.reminders && selectedAquarium.reminders.length > 0) {
        setReminders(
          selectedAquarium.reminders
            .map(
              (reminder: any) =>
                `${reminder.title} (${new Date(
                  reminder.remindAt
                ).toLocaleDateString()})`
            )
            .join(", ")
        );
      } else {
        setReminders("");
      }
    }
  }, [isRemindersModalOpen, selectedAquarium]);

  const handleSave = async () => {
    if (!onSaveReminders) return;

    setIsLoading(true);
    try {
      await onSaveReminders({ reminders });
      closeRemindersModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeRemindersModal();
  };

  if (!isRemindersModalOpen || !selectedAquarium) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isRemindersModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700`}
      style={{ overflow: "visible" }}
    >
      <Card className="w-[98%] min-w-[300px] max-w-md mx-auto bg-[#01EBFF]/5  dark:bg-black/50  backdrop-blur-3xl border border-muted z-50 mt-20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {tDetails("editReminders")}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reminders">{t("reminders")}</Label>
            <Textarea
              id="reminders"
              value={reminders}
              onChange={(e) => setReminders(e.target.value)}
              placeholder={t("remindersPlaceholder")}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("remindersDescription")}
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
