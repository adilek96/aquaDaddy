"use client";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { MdSunny } from "react-icons/md";
import { IoMdMoon } from "react-icons/io";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-black hover:opacity-70 dark:text-white ">
        <IoMdMoon className="h-6 w-6  dark:hidden " />
        <MdSunny className="hidden h-6 w-6 dark:block" />
      </div>
      <span className="sr-only">Theme switch</span>
    </Button>
  );
};

export default ThemeToggle;
