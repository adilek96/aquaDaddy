"use client";
import { Fit } from "@rive-app/canvas";
// import Rive from "@rive-app/react-canvas";

// export const Bg = () => <Rive src="/2.riv" stateMachines="State Machine 1" />;

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
  // const [ystate, setYstate] = useState(false);
  // const [randomNum, setRandomNum] = useState(0);

  // function getRandomNumber() {
  //   // Генерируем случайное целое число от 0 до 10
  //   setYstate(!ystate);
  //   setRandomNum(Math.floor(Math.random() * 5));
  // }

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

  // useEffect(() => {
  //   // Функция, которая будет выполняться через определенные интервалы
  //   setInterval(getRandomNumber, 10000);
  //   // Очистка интервала при размонтировании компонента
  // }, []);

  return (
    <RiveComponent
      style={{ height: "100vh", width: "100vw" }}

      // onMouseLeave={() => rive && rive.play}
    />
  );
}
