"use client";

import { forwardRef } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const LogOutButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { text: string }
>(function LogOutButton({ text, className, onClick, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        signOut();
      }}
      // Выход — деструктивное действие, поэтому он выделен цветом,
      // а не выглядит как обычный пункт меню
      className={`flex w-full items-center gap-2.5 text-destructive ${className ?? ""}`}
      {...props}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>{text}</span>
    </button>
  );
});

export default LogOutButton;
