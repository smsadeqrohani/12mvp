import { ReactNode } from "react";
import { View, Text } from "react-native";

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
  success: "bg-green-900/30 border-green-800/30",
  warning: "bg-yellow-900/30 border-yellow-800/30",
  error: "bg-red-900/30 border-red-800/30",
  info: "bg-blue-900/30 border-blue-800/30",
  default: "bg-gray-700/50 border-gray-600/30",
};

const textColors: Record<BadgeVariant, string> = {
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  info: "text-blue-400",
  default: "text-gray-300",
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
    <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${variantClasses[variant]}`}>
      {dot && <View className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />}
      {icon && <View>{icon}</View>}
      <Text className={`text-xs font-medium ${textColors[variant]}`}>
        {children}
      </Text>
    </View>
  );
}

