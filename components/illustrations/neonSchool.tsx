"use client";

import { useEffect, useRef } from "react";
import { useAnimationStore } from "@/store/animationStore";

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  /** фаза виляния хвостом, у каждой рыбы своя */
  wobble: number;
};

/**
 * Фоновая стайка неонов, которая плывёт за курсором.
 *
 * Рисуется на canvas, а не в DOM: три десятка рыб, каждая со своим
 * положением и поворотом, — это тридцать перерисовок стилей в кадр, если
 * делать элементами. Canvas тут дешевле и не трогает layout вообще.
 *
 * Поведение — упрощённые боиды: расталкивание, выравнивание по соседям,
 * сплочение плюс притяжение к курсору. Прямого «прилипания» нет: стайка
 * подтягивается с задержкой и проскакивает мимо, как настоящая.
 */
export function NeonSchool({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAnimate = useAnimationStore((s) => s.isAnimate);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Курсора нет — на тач-устройствах стайка просто гуляет сама
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    const animated = isAnimate && !reduceMotion;

    // Ограничиваем dpr двойкой: на 3x-экранах втрое больше пикселей
    // в кадр не окупаются для фоновой декорации
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let raf = 0;
    let school: Fish[] = [];

    /** Куда тянется стайка. Догоняет курсор не мгновенно. */
    const target = { x: 0, y: 0 };
    /** Куда стайка уходит сама, когда курсора нет */
    const drift = { t: Math.random() * 1000 };
    let pointerSeen = false;

    const seed = () => {
      // Плотность по площади, но с потолком: на широком мониторе
      // стая не должна превращаться в суп
      const count = Math.max(
        7,
        Math.min(22, Math.round((width * height) / 34000))
      );
      school = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.5;
        // Рождаются рядом друг с другом: так стая видна с первого кадра,
        // а не собирается из россыпи первые несколько секунд
        const r = Math.random() * Math.min(width, height) * 0.3;
        const spread = Math.random() * Math.PI * 2;
        return {
          x: width * 0.5 + Math.cos(spread) * r,
          y: height * 0.5 + Math.sin(spread) * r,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          len: 17 + Math.random() * 10,
          wobble: Math.random() * Math.PI * 2,
        };
      });
      target.x = width * 0.5;
      target.y = height * 0.5;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!animated) draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      pointerSeen = true;
    };

    /** Одна рыба: тело, хвост, неоновая полоса и красное пятно у хвоста */
    const drawFish = (fish: Fish) => {
      const angle = Math.atan2(fish.vy, fish.vx);
      const len = fish.len;
      const half = len * 0.5;
      const tall = len * 0.27;
      // Хвост виляет — иначе рыба выглядит как летящая щепка
      const tailSwing = Math.sin(fish.wobble) * tall * 0.9;

      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(angle);

      // Хвост
      ctx.beginPath();
      ctx.moveTo(-half * 0.75, 0);
      ctx.lineTo(-half * 1.5, tailSwing - tall * 0.85);
      ctx.lineTo(-half * 1.2, 0);
      ctx.lineTo(-half * 1.5, tailSwing + tall * 0.85);
      ctx.closePath();
      ctx.fillStyle = "rgba(148, 210, 235, 0.35)";
      ctx.fill();

      // Полупрозрачное тело
      ctx.beginPath();
      ctx.ellipse(0, 0, half, tall, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(186, 224, 240, 0.28)";
      ctx.fill();

      // Свечение голубой полосы. Вместо дорогого shadowBlur рисуем
      // ту же линию дважды: широкую и бледную, затем узкую и яркую.
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-half * 0.72, -tall * 0.22);
      ctx.lineTo(half * 0.82, -tall * 0.3);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.3)";
      ctx.lineWidth = tall * 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-half * 0.72, -tall * 0.22);
      ctx.lineTo(half * 0.82, -tall * 0.3);
      ctx.strokeStyle = "rgba(125, 240, 255, 0.95)";
      ctx.lineWidth = tall * 0.55;
      ctx.stroke();

      // Красное брюшко у хвоста — вторая узнаваемая черта неона
      ctx.beginPath();
      ctx.moveTo(-half * 0.7, tall * 0.34);
      ctx.lineTo(half * 0.05, tall * 0.3);
      ctx.strokeStyle = "rgba(244, 63, 94, 0.85)";
      ctx.lineWidth = tall * 0.6;
      ctx.stroke();

      // Глаз
      ctx.beginPath();
      ctx.arc(half * 0.66, -tall * 0.12, tall * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 35, 50, 0.75)";
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const fish of school) drawFish(fish);
    };

    const step = () => {
      // Курсора не было или его нет как класса устройства —
      // ведём стайку по медленной восьмёрке
      if (!pointerSeen || !hasPointer) {
        drift.t += 0.004;
        target.x = width * (0.5 + 0.32 * Math.sin(drift.t));
        target.y = height * (0.5 + 0.26 * Math.sin(drift.t * 1.7));
      }

      for (let i = 0; i < school.length; i++) {
        const fish = school[i];

        let sepX = 0;
        let sepY = 0;
        let aliX = 0;
        let aliY = 0;
        let cohX = 0;
        let cohY = 0;
        let neighbours = 0;

        for (let j = 0; j < school.length; j++) {
          if (i === j) continue;
          const other = school[j];
          const dx = fish.x - other.x;
          const dy = fish.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 150 * 150 || distSq === 0) continue;

          // Расталкивание тем сильнее, чем ближе сосед
          if (distSq < 38 * 38) {
            sepX += dx / distSq;
            sepY += dy / distSq;
          }
          aliX += other.vx;
          aliY += other.vy;
          cohX += other.x;
          cohY += other.y;
          neighbours++;
        }

        let ax = 0;
        let ay = 0;

        if (neighbours > 0) {
          aliX /= neighbours;
          aliY /= neighbours;
          ax += (aliX - fish.vx) * 0.08;
          ay += (aliY - fish.vy) * 0.08;

          cohX /= neighbours;
          cohY /= neighbours;
          ax += (cohX - fish.x) * 0.0016;
          ay += (cohY - fish.y) * 0.0016;
        }

        ax += sepX * 12;
        ay += sepY * 12;

        // Притяжение к курсору слабое: стайка догоняет и проскакивает,
        // а не приклеивается к указателю
        const tx = target.x - fish.x;
        const ty = target.y - fish.y;
        const tDist = Math.hypot(tx, ty) || 1;
        ax += (tx / tDist) * 0.06;
        ay += (ty / tDist) * 0.06;

        // Мягко отворачиваем от краёв, чтобы стая не залипала в углу
        const margin = 70;
        if (fish.x < margin) ax += (margin - fish.x) * 0.002;
        if (fish.x > width - margin) ax -= (fish.x - (width - margin)) * 0.002;
        if (fish.y < margin) ay += (margin - fish.y) * 0.002;
        if (fish.y > height - margin) ay -= (fish.y - (height - margin)) * 0.002;

        fish.vx += ax;
        fish.vy += ay;

        // Держим скорость в коридоре: слишком медленные зависают,
        // слишком быстрые выглядят как выстрел
        const speed = Math.hypot(fish.vx, fish.vy);
        const min = 0.45;
        const max = 1.9;
        if (speed > max) {
          fish.vx = (fish.vx / speed) * max;
          fish.vy = (fish.vy / speed) * max;
        } else if (speed < min && speed > 0) {
          fish.vx = (fish.vx / speed) * min;
          fish.vy = (fish.vy / speed) * min;
        }

        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.wobble += 0.18 + speed * 0.08;

        // Страховка от вылета за пределы холста
        if (fish.x < -40) fish.x = width + 40;
        if (fish.x > width + 40) fish.x = -40;
        if (fish.y < -40) fish.y = height + 40;
        if (fish.y > height + 40) fish.y = -40;
      }

      draw();
      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      // Во вкладке в фоне цикл не нужен — это чистый расход батареи
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (animated) {
        raf = requestAnimationFrame(step);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    if (animated) {
      if (hasPointer) window.addEventListener("pointermove", onPointerMove);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAnimate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // pointer-events-none обязателен: слой лежит поверх фона,
      // но не должен перехватывать клики по контенту
      className={`pointer-events-none select-none ${className ?? ""}`}
    />
  );
}
