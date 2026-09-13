"use client";
import { useEffect } from "react";
import { Sparkles, SparklesIcon, Zap, ZapOff } from "lucide-react";
import { Button } from "../ui/button";
import { useAnimationStore } from "@/store/animationStore";
import { useTranslations } from "next-intl";

/**
 * Переключатель анимаций.
 *
 * Раньше он управлял компонентом <Bg /> — анимированной подложкой на Rive.
 * Её вызов в корневом layout был закомментирован, так что тумблер в настройках
 * не делал ничего: состояние писалось в localStorage и там же оставалось.
 *
 * Теперь он ставит на <html> атрибут data-motion="off", по которому CSS гасит
 * все декоративные анимации и переходы — тем же способом, что и системная
 * настройка prefers-reduced-motion.
 */
export default function AnimationToggle() {
  const isAnimate = useAnimationStore((s) => s.isAnimate);
  const setIsAnimate = useAnimationStore((s) => s.setIsAnimate);
  const t = useTranslations("Settings");

  useEffect(() => {
    const stored = localStorage.getItem("animate");
    if (stored === null) {
      localStorage.setItem("animate", "true");
      setIsAnimate(true);
    } else {
      setIsAnimate(stored === "true");
    }
  }, [setIsAnimate]);

  // Применяем выбор к документу — отсюда его подхватывает CSS
  useEffect(() => {
    document.documentElement.dataset.motion = isAnimate ? "on" : "off";
  }, [isAnimate]);

  const toggle = () => {
    const next = !isAnimate;
    setIsAnimate(next);
    localStorage.setItem("animate", String(next));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={isAnimate}
      aria-label={t("animate")}
      className="text-foreground"
    >
      {isAnimate ? (
        <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
      ) : (
        <ZapOff className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}
