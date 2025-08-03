"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaChevronLeft, FaChevronRight, FaExpand } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useImageFullscreenStore } from "@/store/imageFullscreenStore";

interface Image {
  id: string;
  url: string;
  uploadedAt: string;
}

interface ImageSliderProps {
  images: Image[];
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  className = "",
}) => {
  const t = useTranslations("AquariumDetails");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { openFullscreen } = useImageFullscreenStore();

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleOpenFullscreen = useCallback(() => {
    openFullscreen(images, currentIndex);
  }, [openFullscreen, images, currentIndex]);

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center p-8 text-muted-foreground ${className}`}
      >
        <p className="text-sm">{t("noImages")}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Основной слайдер */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex].url}
              alt={`Aquarium ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Навигационные кнопки */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label={t("previousImage")}
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label={t("nextImage")}
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Кнопка полноэкранного режима */}
          <button
            onClick={handleOpenFullscreen}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label={t("fullscreen")}
          >
            <FaExpand className="w-4 h-4" />
          </button>

          {/* Счетчик изображений */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-primary"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageSlider;
