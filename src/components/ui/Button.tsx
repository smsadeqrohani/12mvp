import { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white",
  secondary: "bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600",
  danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-800/30 hover:border-red-700/50",
  success: "bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 border border-green-800/30 hover:border-green-700/50",
  ghost: "bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          در حال پردازش...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
}

