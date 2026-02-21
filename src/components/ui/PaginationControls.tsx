import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaginationControlsProps {
  currentPage: number;
  isDone: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export function PaginationControls({ 
  currentPage, 
  isDone, 
  onNext, 
  onPrev,
  isLoading = false
}: PaginationControlsProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4 border-t border-gray-700/30 bg-gray-800/20">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-gray-400" style={{ fontFamily: 'Meem-Regular' }}>
          صفحه {currentPage.toLocaleString('fa-IR')}
        </Text>
        {isLoading && (
          <ActivityIndicator size="small" color="#ff701a" />
        )}
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onPrev}
          disabled={currentPage === 1 || isLoading}
          className="flex-row items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg disabled:bg-gray-800/50 disabled:opacity-50"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={currentPage === 1 || isLoading ? "#4b5563" : "#fff"} />
          <Text className={`text-sm font-medium ${currentPage === 1 || isLoading ? "text-gray-600" : "text-white"}`} style={{ fontFamily: 'Meem-SemiBold' }}>
            قبلی
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          disabled={isDone || isLoading}
          className="flex-row items-center gap-2 px-4 py-2 bg-accent rounded-lg disabled:bg-gray-800/50 disabled:opacity-50"
          activeOpacity={0.7}
        >
          <Text className={`text-sm font-medium ${isDone || isLoading ? "text-gray-600" : "text-white"}`} style={{ fontFamily: 'Meem-SemiBold' }}>
            بعدی
          </Text>
          <Ionicons name="chevron-forward" size={16} color={isDone || isLoading ? "#4b5563" : "#fff"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

