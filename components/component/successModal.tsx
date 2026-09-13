"use client";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useSettingStore } from "@/store/modalsStore";
import Link from "next/link";
import { CheckCircle, Edit, Home } from "lucide-react";
import { useModalDismiss } from "@/lib/useModalDismiss";

export default function SuccessModal() {
  const t = useTranslations("AquariumForm");
  const { isSuccessModalOpen, successModalData, closeSuccessModal } =
    useSettingStore();

  // Хук вызываем до раннего return, иначе порядок хуков поедет
  useModalDismiss(isSuccessModalOpen, closeSuccessModal);

  if (!isSuccessModalOpen || !successModalData) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-modal overflow-y-auto overscroll-contain bg-scrim/60 p-4 backdrop-blur-sm ${
        isSuccessModalOpen ? "flex" : "hidden"
      } items-start justify-center sm:items-center`}
    >
      <Card className="surface-panel-raised my-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <CardTitle className="text-2xl font-bold text-success">
            {t("successModalTitle")}
          </CardTitle>
          <CardDescription className="text-lg">
            {t("successModalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {t("successModalMessage")}
          </p>

          <div className="flex flex-col gap-3">
            <Link href={`/myTanks/${successModalData.aquariumId}`}>
              <Button
                className="w-full"
                onClick={closeSuccessModal}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t("successModalEditButton")}
              </Button>
            </Link>

            <Link href="/myTanks">
              <Button
                variant="outline"
                className="w-full"
                onClick={closeSuccessModal}
              >
                <Home className="w-4 h-4 mr-2" />
                {t("successModalBackToList")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
