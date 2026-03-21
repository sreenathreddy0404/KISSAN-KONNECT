import { cn } from "@/lib/utils";
import React from "react";


const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const speedMap = {
  slow: "animate-spin-slow",
  normal: "animate-spin",
  fast: "animate-spin-fast",
};

export const LoadingSpinner = ({
  size = "md",
  color = "text-primary",
  label = "Loading...",
  speed = "normal",
  centered = false,
  className,
  ...props
}) => {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-2 border-current border-t-transparent",
        speedMap[speed],
        color,
        typeof size === "number" ? "" : sizeMap[size],
        className
      )}
      style={typeof size === "number" ? { width: size, height: size } : undefined}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex justify-center items-center min-h-[200px] w-full">
        {spinner}
      </div>
    );
  }

  return spinner;
};