import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  className?: string;
}

/**
 * PageContainer - Consistent page layout wrapper
 * Provides standard padding and max-width for pages
 */
export function PageContainer({ 
  children, 
  maxWidth = "none",
  className = "" 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
    none: "max-w-none",
  };

  return (
    <div className={`w-full ${maxWidthClasses[maxWidth]} px-6 py-8 ${className}`}>
      {children}
    </div>
  );
}

