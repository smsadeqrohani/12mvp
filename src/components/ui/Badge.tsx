import { ReactNode } from "react";

type BadgeVariant = 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "default";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-900/30 text-green-400 border-green-800/30",
  warning: "bg-yellow-900/30 text-yellow-400 border-yellow-800/30",
  error: "bg-red-900/30 text-red-400 border-red-800/30",
  info: "bg-blue-900/30 text-blue-400 border-blue-800/30",
  default: "bg-gray-700/50 text-gray-300 border-gray-600/30",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-green-400",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  info: "bg-blue-400",
  default: "bg-gray-400",
};

export function Badge({ children, variant = "default", icon, dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}
    >
      {dot && <div className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />}
      {icon}
      {children}
    </span>
  );
}

