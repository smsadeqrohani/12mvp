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

export function SkeletonTable({ rows = 5, hasHeader = true }: { rows?: number; hasHeader?: boolean }) {
  return (
    <View className="bg-gradient-to-br from-background-light/80 to-background-light/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden shadow-2xl shadow-black/20">
      {/* Table Header */}
      {hasHeader && (
        <View className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50 p-6">
          <View className="flex-row gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </View>
        </View>
      )}
      
      {/* Table Rows */}
      <View className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} className="flex-row items-center gap-4 min-h-[60px]">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32 rounded-lg" />
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

export function SkeletonAdminTab() {
  return (
    <View className="flex-1">
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </View>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </View>
      </View>
      
      {/* Table */}
      <SkeletonTable rows={10} />
    </View>
  );
}
