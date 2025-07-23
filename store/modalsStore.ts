import { create } from 'zustand'

type SuccessModalData = {
  aquariumId: string;
  aquariumName: string;
}

type Store = {
  isOpen: boolean
  setIsOpen: () => void
  // Новые поля для модального окна успешного добавления
  isSuccessModalOpen: boolean
  successModalData: SuccessModalData | null
  openSuccessModal: (data: SuccessModalData) => void
  closeSuccessModal: () => void
}

export const useSettingStore = create<Store>()((set) => ({
  isOpen: false,
  setIsOpen: () => set((state) => ({isOpen: !state.isOpen})),
  // Новые поля для модального окна успешного добавления
  isSuccessModalOpen: false,
  successModalData: null,
  openSuccessModal: (data: SuccessModalData) => set({ 
    isSuccessModalOpen: true, 
    successModalData: data 
  }),
  closeSuccessModal: () => set({ 
    isSuccessModalOpen: false, 
    successModalData: null 
  }),
}))
