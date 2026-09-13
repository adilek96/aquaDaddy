import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-semibold tap-fast select-none",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-fast ease-out-soft",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Нажатие отзывается визуально, но не двигает соседей
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        success:
          "bg-success text-success-foreground shadow-soft hover:bg-success/90",
        outline:
          "border border-input bg-background/60 backdrop-blur-sm hover:border-primary/50 hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary/15 text-secondary-foreground hover:bg-secondary/25 dark:text-foreground",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 44px — минимальная цель для пальца, поэтому базовый размер h-11
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
