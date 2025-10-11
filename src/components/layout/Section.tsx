import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

type SectionVariant = "default" | "glass" | "card";
type SectionPadding = "none" | "sm" | "md" | "lg";

interface SectionProps {
  children: ReactNode;
  variant?: SectionVariant;
  padding?: SectionPadding;
  className?: string;
  style?: ViewStyle;
}

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-background-light/40",
  glass: "bg-background-light/60 backdrop-blur-sm",
  card: "bg-background-light border border-gray-700/30",
};

const paddingClasses: Record<SectionPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Section({
  children,
  variant = "glass",
  padding = "md",
  className = "",
  style,
}: SectionProps) {
  return (
    <View
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
