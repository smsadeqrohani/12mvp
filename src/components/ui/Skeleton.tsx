import { View } from "react-native";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <View className={`bg-gray-700/50 animate-pulse rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-background-light/60 rounded-xl border border-gray-700/30 p-6">
      <View className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </View>
    </View>
  );
}

export function SkeletonTable() {
  return (
    <View className="bg-background-light/60 rounded-xl border border-gray-700/30 overflow-hidden">
      <View className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonForm() {
  return (
    <View className="bg-background-light/60 rounded-xl border border-gray-700/30 p-6">
      <View className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </View>
    </View>
  );
}
