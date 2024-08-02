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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // console.log((event.clientX / maxWidth) * 100);
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
      setMouseMovement({
        x: event.movementX,
        y: event.movementY,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Очистка обработчика при размонтировании компонента
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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
  }, [mouseMovement.x, moveTo, numX, numY, mousePosition]);

  return (
    <RiveComponent
      style={{ height: "100vh", width: "100vw" }}

      // onMouseLeave={() => rive && rive.play}
    />
  );
}
