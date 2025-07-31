import { create } from "zustand";

interface WaterParamsStore {
  isOpen: boolean;
  onSave: ((waterParameters: any) => Promise<void>) | null;
  title: string;
  openModal: (onSave: (waterParameters: any) => Promise<void>, title?: string) => void;
  closeModal: () => void;
}

export const useWaterParamsStore = create<WaterParamsStore>((set) => ({
  isOpen: false,
  onSave: null,
  title: "",
  openModal: (onSave, title = "") =>
    set({
      isOpen: true,
      onSave,
      title,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      onSave: null,
      title: "",
    }),
})); 