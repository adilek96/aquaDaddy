"use client";

import React, { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useImageFullscreenStore } from "@/store/imageFullscreenStore";

const ImageFullscreenModal: React.FC = () => {
  const t = useTranslations("AquariumDetails");
  const {
    isOpen,
    images,
    currentIndex,
    imageScale,
    closeFullscreen,
    setImageScale,
    nextImage,
    prevImage,
  } = useImageFullscreenStore();

  // Обработка клавиш для навигации
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          prevImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "Escape":
          closeFullscreen();
          break;
        case "+":
        case "=":
          setImageScale(Math.min(imageScale * 1.2, 3));
          break;
        case "-":
          setImageScale(Math.max(imageScale / 1.2, 0.5));
          break;
        case "0":
          setImageScale(1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, imageScale, prevImage, nextImage, closeFullscreen, setImageScale]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#01EBFF]/5 dark:bg-black/50 backdrop-blur-3xl flex items-center justify-center p-8"
        onClick={closeFullscreen}
      >
        <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
          {/* Кнопка закрытия */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label={t("close")}
          >
            <FaTimes className="w-6 h-6" />
          </button>

          {/* Изображение */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex].url}
                alt={`Aquarium ${currentIndex + 1}`}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain cursor-zoom-in rounded-lg"
                style={{ transform: `scale(${imageScale})` }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Навигационные кнопки в полноэкранном режиме */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  aria-label={t("previousImage")}
                >
                  <FaChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  aria-label={t("nextImage")}
                >
                  <FaChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Счетчик изображений в полноэкранном режиме */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-sm rounded-full z-10">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Подсказки по управлению */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white text-xs rounded-full z-10 opacity-75">
              +/- для масштаба, 0 для сброса, ←→ для навигации
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageFullscreenModal; 