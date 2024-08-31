import { create } from 'zustand'

type Store = {
  isOpen: boolean
  setIsOpen: () => void
}

export  const useSettingStore = create<Store>()((set) => ({
  isOpen: false,
  setIsOpen: () => set((state) => ({isOpen: !state.isOpen})),
}))
