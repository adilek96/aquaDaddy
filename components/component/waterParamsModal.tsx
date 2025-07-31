"use client";
import { useWaterParamsStore } from "@/store/waterParamsStore";
import { WaterParametersForm } from "./waterParametersForm";

export default function WaterParamsModal() {
  const { isOpen, onSave, title, closeModal } = useWaterParamsStore();

  const handleSave = async (waterParameters: any) => {
    if (onSave) {
      await onSave(waterParameters);
    }
    closeModal();
  };

  return (
    <WaterParametersForm
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleSave}
      title={title}
    />
  );
} 