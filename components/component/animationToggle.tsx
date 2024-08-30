"use client";
import { useState } from "react";

export default function AnimationToggle() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <button
      //   onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-black hover:opacity-70 dark:text-white "
    ></button>
  );
}
