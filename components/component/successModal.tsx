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

export default function SuccessModal() {
  const t = useTranslations("AquariumForm");
  const { isSuccessModalOpen, successModalData, closeSuccessModal } =
    useSettingStore();

  if (!isSuccessModalOpen || !successModalData) {
    return null;
  }

  return (
    <div
      className={`w-full h-full ${
        isSuccessModalOpen ? "flex" : "hidden"
      } justify-center items-center fixed top-0 left-0 z-50 backdrop-blur-md transition-all duration-700 overscroll-none overflow-hidden`}
    >
      <Card className="w-[98%] max-w-md  mx-auto  backdrop-blur-md border border-muted bg-[#00EBFF]/5 dark:bg-black/30 z-50 mt-20 ">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {t("successModalTitle")}
          </CardTitle>
          <CardDescription className="text-lg">
            {t("successModalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {t("successModalMessage")}
          </p>

          <div className="flex flex-col gap-3">
            <Link href={`/myTanks/${successModalData.aquariumId}`}>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
