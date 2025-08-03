import { create } from 'zustand'

interface Image {
  id: string;
  url: string;
  uploadedAt: string;
}

type ImageFullscreenStore = {
  isOpen: boolean
  images: Image[]
  currentIndex: number
  imageScale: number
  openFullscreen: (images: Image[], initialIndex?: number) => void
  closeFullscreen: () => void
  setCurrentIndex: (index: number) => void
  setImageScale: (scale: number) => void
  nextImage: () => void
  prevImage: () => void
}

export const useImageFullscreenStore = create<ImageFullscreenStore>()((set, get) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,
  imageScale: 1,
  
  openFullscreen: (images: Image[], initialIndex = 0) => set({ 
    isOpen: true, 
    images, 
    currentIndex: initialIndex,
    imageScale: 1
  }),
  
  closeFullscreen: () => set({ 
    isOpen: false, 
    images: [], 
    currentIndex: 0,
    imageScale: 1
  }),
  
  setCurrentIndex: (index: number) => set({ currentIndex: index }),
  
  setImageScale: (scale: number) => set({ imageScale: scale }),
  
  nextImage: () => {
    const { images, currentIndex } = get()
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    set({ currentIndex: newIndex, imageScale: 1 })
  },
  
  prevImage: () => {
    const { images, currentIndex } = get()
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    set({ currentIndex: newIndex, imageScale: 1 })
  },
})) 