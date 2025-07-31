import { create } from "zustand";

export interface NewMaintenanceData {
  type: (
    | "WATER_CHANGE"
    | "GRAVEL_CLEANING"
    | "GLASS_CLEANING"
    | "FILTER_CLEANING"
    | "PARAMETER_CHECK"
    | "PLANT_CARE"
    | "CORAL_CARE"
    | "SUPPLEMENTS"
    | "ALGAE_CONTROL"
    | "OTHER"
  )[];
  description: string;
}

interface MaintenanceAddStore {
  isOpen: boolean;
  selectedDate: Date | null;
  newMaintenance: NewMaintenanceData;
  onSave: ((data: NewMaintenanceData, date: Date) => Promise<void>) | null;
  openModal: (date: Date, onSave: (data: NewMaintenanceData, date: Date) => Promise<void>) => void;
  closeModal: () => void;
  updateNewMaintenance: (data: Partial<NewMaintenanceData>) => void;
  resetNewMaintenance: () => void;
}

const initialNewMaintenance: NewMaintenanceData = {
  type: [],
  description: "",
};

export const useMaintenanceAddStore = create<MaintenanceAddStore>((set) => ({
  isOpen: false,
  selectedDate: null,
  newMaintenance: initialNewMaintenance,
  onSave: null,
  openModal: (date, onSave) =>
    set({
      isOpen: true,
      selectedDate: date,
      newMaintenance: initialNewMaintenance,
      onSave,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      selectedDate: null,
      newMaintenance: initialNewMaintenance,
      onSave: null,
    }),
  updateNewMaintenance: (data) =>
    set((state) => ({
      newMaintenance: { ...state.newMaintenance, ...data },
    })),
  resetNewMaintenance: () =>
    set({
      newMaintenance: initialNewMaintenance,
    }),
})); 