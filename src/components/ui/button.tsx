import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
  ghost:
    "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-95",
        buttonVariants[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
