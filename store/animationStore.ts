import { create } from 'zustand'

type Store = {
  isAnimate: boolean
  setIsAnimate: () => void
}

export  const useAnimationStore = create<Store>()((set) => ({
  isAnimate: true,
  setIsAnimate: () => set((state) => ({isAnimate: !state.isAnimate})),
}))
