"use client";
import { SVGProps, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAnimationStore } from "@/store/animationStore";

export default function AnimationToggle() {
  const { isAnimate, setIsAnimate } = useAnimationStore();

  useEffect(() => {
    const initialStorageValue = localStorage.getItem("animate");

    if (initialStorageValue === null || initialStorageValue === undefined) {
      localStorage.setItem("animate", "true");
      setIsAnimate(true);
    } else {
      setIsAnimate(initialStorageValue === "true");
    }
  }, [setIsAnimate]);

  const changeHandler = () => {
    setIsAnimate(!isAnimate);
    localStorage.setItem("animate", `${!isAnimate}`);
  };

  return (
    <Button variant="ghost" size="icon" onClick={() => changeHandler()}>
      <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-black hover:opacity-70 dark:text-white ">
        {isAnimate ? <Off /> : <On />}
      </div>
      <span className="sr-only">Animation switch</span>
    </Button>
  );
}

function Off(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function On(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5.005 11.19V12l6.998 4.042L19 12v-.81M5 16.15v.81L11.997 21l6.998-4.042v-.81M12.003 3 5.005 7.042l6.998 4.042L19 7.042 12.003 3Z"
      />
    </svg>
  );
}
