import { create } from "zustand";

interface AquariumData {
  id: string;
  name: string;
  description?: string;
  type?: string;
  shape?: string;
  isPublic?: boolean;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  diameterCm?: number | null;
  sideCm?: number | null;
  depthCm?: number | null;
  volumeLiters?: number | null;
  k?: number;
  inhabitants?: any[];
  waterParams?: any;
  reminders?: any[];
  startDate?: string | Date;
}

interface AquariumEditStore {
  // Состояние модальных окон
  isDescriptionModalOpen: boolean;
  isSpecificationsModalOpen: boolean;
  isInhabitantsModalOpen: boolean;
  isWaterParamsModalOpen: boolean;
  isRemindersModalOpen: boolean;
  isTimelineModalOpen: boolean;
  isOverviewModalOpen: boolean;
  isDeleteModalOpen: boolean;

  // Данные аквариума
  selectedAquarium: AquariumData | null;
  
  // Callback функции для сохранения
  onSaveDescription: ((data: { description: string }) => Promise<void>) | null;
  onSaveSpecifications: ((data: any) => Promise<void>) | null;
  onSaveInhabitants: ((data: { inhabitants: string }) => Promise<void>) | null;
  onSaveWaterParams: ((data: { waterParameters: any }) => Promise<void>) | null;
  onSaveReminders: ((data: { reminders: string }) => Promise<void>) | null;
  onSaveTimeline: ((data: { startDate: string }) => Promise<void>) | null;
  onSaveOverview: ((data: { type: string; shape: string; isPublic: boolean }) => Promise<void>) | null;
  onDeleteAquarium: ((tankId: string) => Promise<void>) | null;

  // Методы для открытия модальных окон
  openDescriptionModal: (aquarium: AquariumData, onSave: (data: { description: string }) => Promise<void>) => void;
  openSpecificationsModal: (aquarium: AquariumData, onSave: (data: any) => Promise<void>) => void;
  openInhabitantsModal: (aquarium: AquariumData, onSave: (data: { inhabitants: string }) => Promise<void>) => void;
  openWaterParamsModal: (aquarium: AquariumData, onSave: (data: { waterParameters: any }) => Promise<void>) => void;
  openRemindersModal: (aquarium: AquariumData, onSave: (data: { reminders: string }) => Promise<void>) => void;
  openTimelineModal: (aquarium: AquariumData, onSave: (data: { startDate: string }) => Promise<void>) => void;
  openOverviewModal: (aquarium: AquariumData, onSave: (data: { type: string; shape: string; isPublic: boolean }) => Promise<void>) => void;
  openDeleteModal: (aquarium: AquariumData, onDelete: (tankId: string) => Promise<void>) => void;

  // Методы для закрытия модальных окон
  closeDescriptionModal: () => void;
  closeSpecificationsModal: () => void;
  closeInhabitantsModal: () => void;
  closeWaterParamsModal: () => void;
  closeRemindersModal: () => void;
  closeTimelineModal: () => void;
  closeOverviewModal: () => void;
  closeDeleteModal: () => void;
}

export const useAquariumEditStore = create<AquariumEditStore>((set) => ({
  // Начальное состояние
  isDescriptionModalOpen: false,
  isSpecificationsModalOpen: false,
  isInhabitantsModalOpen: false,
  isWaterParamsModalOpen: false,
  isRemindersModalOpen: false,
  isTimelineModalOpen: false,
  isOverviewModalOpen: false,
  isDeleteModalOpen: false,

  selectedAquarium: null,
  
  onSaveDescription: null,
  onSaveSpecifications: null,
  onSaveInhabitants: null,
  onSaveWaterParams: null,
  onSaveReminders: null,
  onSaveTimeline: null,
  onSaveOverview: null,
  onDeleteAquarium: null,

  // Методы для открытия модальных окон
  openDescriptionModal: (aquarium: AquariumData, onSave: (data: { description: string }) => Promise<void>) => {
    set({
      isDescriptionModalOpen: true,
      selectedAquarium: aquarium,
      onSaveDescription: onSave,
    });
  },

  openSpecificationsModal: (aquarium: AquariumData, onSave: (data: any) => Promise<void>) => {
    set({
      isSpecificationsModalOpen: true,
      selectedAquarium: aquarium,
      onSaveSpecifications: onSave,
    });
  },

  openInhabitantsModal: (aquarium: AquariumData, onSave: (data: { inhabitants: string }) => Promise<void>) => {
    set({
      isInhabitantsModalOpen: true,
      selectedAquarium: aquarium,
      onSaveInhabitants: onSave,
    });
  },

  openWaterParamsModal: (aquarium: AquariumData, onSave: (data: { waterParameters: any }) => Promise<void>) => {
    set({
      isWaterParamsModalOpen: true,
      selectedAquarium: aquarium,
      onSaveWaterParams: onSave,
    });
  },

  openRemindersModal: (aquarium: AquariumData, onSave: (data: { reminders: string }) => Promise<void>) => {
    set({
      isRemindersModalOpen: true,
      selectedAquarium: aquarium,
      onSaveReminders: onSave,
    });
  },

  openTimelineModal: (aquarium: AquariumData, onSave: (data: { startDate: string }) => Promise<void>) => {
    set({
      isTimelineModalOpen: true,
      selectedAquarium: aquarium,
      onSaveTimeline: onSave,
    });
  },

  openOverviewModal: (aquarium: AquariumData, onSave: (data: { type: string; shape: string; isPublic: boolean }) => Promise<void>) => {
    set({
      isOverviewModalOpen: true,
      selectedAquarium: aquarium,
      onSaveOverview: onSave,
    });
  },

  openDeleteModal: (aquarium: AquariumData, onDelete: (tankId: string) => Promise<void>) => {
    set({
      isDeleteModalOpen: true,
      selectedAquarium: aquarium,
      onDeleteAquarium: onDelete,
    });
  },

  // Методы для закрытия модальных окон
  closeDescriptionModal: () => {
    set({
      isDescriptionModalOpen: false,
      selectedAquarium: null,
      onSaveDescription: null,
    });
  },

  closeSpecificationsModal: () => {
    set({
      isSpecificationsModalOpen: false,
      selectedAquarium: null,
      onSaveSpecifications: null,
    });
  },

  closeInhabitantsModal: () => {
    set({
      isInhabitantsModalOpen: false,
      selectedAquarium: null,
      onSaveInhabitants: null,
    });
  },

  closeWaterParamsModal: () => {
    set({
      isWaterParamsModalOpen: false,
      selectedAquarium: null,
      onSaveWaterParams: null,
    });
  },

  closeRemindersModal: () => {
    set({
      isRemindersModalOpen: false,
      selectedAquarium: null,
      onSaveReminders: null,
    });
  },

  closeTimelineModal: () => {
    set({
      isTimelineModalOpen: false,
      selectedAquarium: null,
      onSaveTimeline: null,
    });
  },

  closeOverviewModal: () => {
    set({
      isOverviewModalOpen: false,
      selectedAquarium: null,
      onSaveOverview: null,
    });
  },

  closeDeleteModal: () => {
    set({
      isDeleteModalOpen: false,
      selectedAquarium: null,
      onDeleteAquarium: null,
    });
  },
})); 