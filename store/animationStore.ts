import { create } from 'zustand'

type Store = {
  isAnimate: boolean
  setIsAnimate: (animate: boolean) => void
}

export  const useAnimationStore = create<Store>()((set) => ({
  isAnimate: true,
  setIsAnimate: (animate) => set(() => ({isAnimate: animate})),
}))
