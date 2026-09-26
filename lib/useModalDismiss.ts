"use client";

import { useEffect } from "react";

/**
 * Базовое поведение модального окна, которого не было ни у одного из
 * двенадцати окон проекта: закрытие по Escape и блокировка прокрутки фона.
 * Без второго на телефоне за открытым окном продолжала скроллиться страница,
 * а на десктопе прокрутка «проваливалась» на подложку.
 */
export function useModalDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    // Компенсируем ширину скроллбара, иначе при блокировке прокрутки
    // страница под окном заметно дёргается вбок
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
      // Та же переменная, что публикует react-remove-scroll внутри Radix.
      // По ней фиксированные элементы (шапка, тосты) сдвигаются на столько же,
      // иначе их содержимое прыгает: отступ body до них не доходит.
      document.body.style.setProperty(
        "--removed-body-scroll-bar-size",
        `${scrollbar}px`
      );
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      document.body.style.removeProperty("--removed-body-scroll-bar-size");
    };
  }, [open, onClose]);
}
