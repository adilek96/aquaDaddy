import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // h-11 = 44px под палец; text-base на мобильных, иначе iOS зумит
          // страницу при фокусе на поле с шрифтом меньше 16px
          "flex h-11 w-full rounded-lg border border-input bg-background/70 px-3.5 py-2",
          "text-base sm:text-sm",
          "shadow-sm backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-fast",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "hover:border-primary/40",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
