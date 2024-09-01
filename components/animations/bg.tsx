"use client";
import { useAnimationStore } from "@/store/animationStore";
import { Fit } from "@rive-app/canvas";

import {
  Alignment,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";
import { useEffect, useRef, useState } from "react";

export function Bg() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseMovement, setMouseMovement] = useState({ x: 0, y: 0 });
  const { isAnimate, setIsAnimate } = useAnimationStore();
  const [animate, setAnimate] = useState<null | string>();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
      setMouseMovement({
        x: event.movementX,
        y: event.movementY,
      });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const newX = touch.clientX;
        const newY = touch.clientY;

        setMouseMovement({
          x: newX - mousePosition.x,
          y: newY - mousePosition.y,
        });

        setMousePosition({
          x: newX,
          y: newY,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);

    // Очистка обработчиков при размонтировании компонента
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mousePosition]);

  const { rive, RiveComponent } = useRive({
    src: "/2.riv",
    stateMachines: "BG",
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  const moveToX = useStateMachineInput(rive, "BG", "moveToX");
  const moveToY = useStateMachineInput(rive, "BG", "moveToY");
  const numX = useStateMachineInput(rive, "BG", "NumX");
  const numY = useStateMachineInput(rive, "BG", "NumY");

  useEffect(() => {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    if (moveToX) {
      moveToX.value = mouseMovement.x;
    }
    if (moveToY) {
      moveToY.value = mouseMovement.y;
    }
    if (numX) {
      numX.value = (mousePosition.x / maxWidth) * 100;
    }
    if (numY) {
      numY.value = 100 - (mousePosition.y / maxHeight) * 100;
    }
  }, [mouseMovement, numX, numY, mousePosition]);

  useEffect(() => {
    setAnimate(localStorage.getItem("animate"));
  }, [isAnimate]);

  if (animate === "true") {
    return <RiveComponent style={{ height: "100vh", width: "100vw" }} />;
  }

  return <div style={{ height: "100vh", width: "100vw" }}></div>;
}
