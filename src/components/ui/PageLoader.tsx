import { View, Text } from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "در حال بارگذاری..." }: PageLoaderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 min-h-[400px]">
      <LoadingSpinner />
      <Text className="text-gray-400 text-sm">{message}</Text>
    </View>
  );
}

