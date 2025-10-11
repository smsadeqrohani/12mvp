import { View, Text, ActivityIndicator } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  className?: string;
  color?: string;
}

export function LoadingSpinner({ size = "large", className = "", color = "#ff701a" }: LoadingSpinnerProps) {
  return (
    <View className={className}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "در حال بارگذاری..." }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <LoadingSpinner size="large" />
      {text && <Text className="text-gray-400 mt-4">{text}</Text>}
    </View>
  );
}

