import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export utilities for convenience
export * from "./validation";
export * from "./formatting";
export * from "./storage";
export * from "./helpers";
