import { create } from "zustand";

interface MaintenanceData {
  id: string;
  performedAt: Date;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "SKIPPED";
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
  WaterLog?: any[];
}

interface EditMaintenanceData {
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
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "SKIPPED";
}

interface MaintenanceEditStore {
  isOpen: boolean;
  selectedMaintenance: MaintenanceData | null;
  editData: EditMaintenanceData;
  onSave: ((data: EditMaintenanceData) => Promise<void>) | null;
  openModal: (maintenance: MaintenanceData, onSave: (data: EditMaintenanceData) => Promise<void>) => void;
  closeModal: () => void;
  updateEditData: (data: Partial<EditMaintenanceData>) => void;
  resetEditData: () => void;
}

const initialEditData: EditMaintenanceData = {
  type: [],
  description: "",
  status: "PENDING",
};

export const useMaintenanceEditStore = create<MaintenanceEditStore>((set, get) => ({
  isOpen: false,
  selectedMaintenance: null,
  editData: initialEditData,
  onSave: null,

  openModal: (maintenance: MaintenanceData, onSave: (data: EditMaintenanceData) => Promise<void>) => {
    // Определяем начальный статус в зависимости от даты и текущего статуса
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maintenanceDate = new Date(maintenance.performedAt);
    maintenanceDate.setHours(0, 0, 0, 0);
    const isToday = maintenanceDate.getTime() === today.getTime();
    const isFuture = maintenanceDate > today;

    let initialStatus = maintenance.status;

    // Для старых записей со статусом SKIPPED оставляем как есть
    if (!isToday && !isFuture && maintenance.status === "SKIPPED") {
      initialStatus = "SKIPPED";
    }
    // Для сегодняшних записей со статусом PENDING оставляем как есть
    else if (isToday && maintenance.status === "PENDING") {
      initialStatus = "PENDING";
    }
    // Для будущих записей оставляем текущий статус как есть
    else if (isFuture) {
      initialStatus = maintenance.status;
    }
    // Для остальных случаев устанавливаем PENDING
    else {
      initialStatus = "PENDING";
    }

    set({
      isOpen: true,
      selectedMaintenance: maintenance,
      editData: {
        type: maintenance.type,
        description: maintenance.description,
        status: initialStatus,
      },
      onSave,
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      selectedMaintenance: null,
      editData: initialEditData,
      onSave: null,
    });
  },

  updateEditData: (data: Partial<EditMaintenanceData>) => {
    set((state) => ({
      editData: { ...state.editData, ...data },
    }));
  },

  resetEditData: () => {
    set({
      editData: initialEditData,
    });
  },
})); 