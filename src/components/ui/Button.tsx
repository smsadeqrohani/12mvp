import { ReactNode } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator, ViewStyle } from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent active:bg-accent-hover",
  secondary: "bg-gray-700/50 active:bg-gray-600 border border-gray-600",
  danger: "bg-red-600/20 active:bg-red-600/30 border border-red-800/30",
  success: "bg-green-600/20 active:bg-green-600/30 border border-green-800/30",
  ghost: "bg-transparent active:bg-gray-700/50",
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-gray-300",
  danger: "text-red-400",
  success: "text-green-400",
  ghost: "text-gray-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading,
  disabled,
  onPress,
  children,
  className = "",
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-2 rounded-lg ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={0.7}
      style={style}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color={variant === "primary" ? "#fff" : "#ff701a"} />
          <Text className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
            در حال پردازش...
          </Text>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <View>{icon}</View>}
          <Text className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
            {children}
          </Text>
          {icon && iconPosition === "right" && <View>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

