import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  variant?: "default" | "card" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

/**
 * Section - Reusable section/container component
 * Provides consistent styling for content sections
 */
export function Section({ 
  children, 
  variant = "default",
  padding = "md",
  className = "" 
}: SectionProps) {
  const variantClasses = {
    default: "",
    card: "bg-background-light/60 rounded-2xl border border-gray-700/30",
    glass: "bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

