"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { FaUpload, FaTrash, FaEye, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { useImageFullscreenStore } from "@/store/imageFullscreenStore";

interface ImageUploaderProps {
  aquariumId: string;
  images: any[];
  onImagesUpdate: (images: any[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  aquariumId,
  images,
  onImagesUpdate,
}) => {
  const t = useTranslations("AquariumDetails");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgErrorIds, setImgErrorIds] = useState<{ [id: string]: boolean }>({});
  const [modalImgError, setModalImgError] = useState(false);
  const { openFullscreen } = useImageFullscreenStore();

  const handleOpenFullscreen = useCallback(
    (index: number) => {
      openFullscreen(images, index);
    },
    [openFullscreen, images, selectedImage]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      alert(t("fileTypeError"));
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(t("fileSizeError"));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Симуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append("file", file);
      formData.append("aquariumId", aquariumId);

      // Отправляем файл на наш API endpoint
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.statusText}`);
      }

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Обновляем список изображений с реальными данными из БД
        const newImage = {
          id: result.imageId,
          url: result.url!,
          uploadedAt: result.uploadedAt,
        };
        onImagesUpdate([newImage, ...images]);
      } else {
        alert(`${t("uploadError")}: ${result.error}`);
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert(t("uploadError"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    // Находим изображение для получения URL
    const imageToDelete = images.find((img) => img.id === imageId);
    if (!imageToDelete) {
      alert(t("deleteError"));
      return;
    }

    setDeletingImage(imageId);
    try {
      // Отправляем запрос на удаление через наш API endpoint
      const response = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: imageId,
          aquariumId: aquariumId,
          url: imageToDelete.url,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        onImagesUpdate(images.filter((img) => img.id !== imageId));
      } else {
        alert(`${t("deleteError")}: ${result.error}`);
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert(t("deleteError"));
    } finally {
      setDeletingImage(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Загрузчик */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <div className="space-y-3">
            <FaUpload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isUploading ? t("uploading") : t("dragDropMessage")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("supportedFormats")}
              </p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {t("selectFile")}
              </button>
            )}
          </div>

          {/* Прогресс загрузки */}
          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {uploadProgress}% {t("uploadProgress")}
              </p>
            </div>
          )}
        </div>

        {/* Галерея изображений */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("uploadedImages")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-muted hover:border-primary/50 transition-all duration-200"
                  >
                    {image.url ? (
                      <Image
                        src={
                          imgErrorIds[image.id] ? "/app-logo.svg" : image.url
                        }
                        alt="Aquarium"
                        className="w-full h-full object-cover"
                        width={200}
                        height={200}
                        onError={() =>
                          setImgErrorIds((prev) => ({
                            ...prev,
                            [image.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                    )}

                    {/* Overlay с кнопками */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenFullscreen(index)}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        title={t("viewImage")}
                      >
                        <FaEye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deletingImage === image.id}
                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors disabled:opacity-50"
                        title={t("deleteImage")}
                      >
                        {deletingImage === image.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Дата загрузки */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      {/* Модальное окно для просмотра изображения
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute -top-4 -right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaTimes className="w-6 h-6 text-white" />
              </button>
              {selectedImage ? (
                <Image
                  src={modalImgError ? "/app-logo.svg" : selectedImage}
                  alt="Aquarium"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  width={800}
                  height={600}
                  priority
                  onError={() => setModalImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
};

export default ImageUploader;
