import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ActiveItemCard {
  id: string;
  label: string;
  title: string;
  imageUrl?: string | null;
}

export interface ActiveItemsCardsProps {
  stadium?: ActiveItemCard | null;
  mentor?: ActiveItemCard | null;
  onPressStadium?: () => void;
  onPressMentor?: () => void;
}

function SingleItemCard({
  item,
  fallbackLabel,
  onPress,
}: {
  item?: ActiveItemCard | null;
  fallbackLabel: string;
  onPress?: () => void;
}) {
  const label = item?.label ?? fallbackLabel;
  const title = item?.title ?? "پیش‌فرض";
  const imageUrl = item?.imageUrl ?? null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-1 bg-background-light rounded-2xl border border-gray-700/30 overflow-hidden"
    >
      <View className="flex-row items-center justify-between px-3 pt-2">
        <Text
          className="text-xs text-gray-300"
          style={{ fontFamily: "Meem-SemiBold" }}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Ionicons name="football" size={14} color="#9ca3af" />
      </View>
      <View className="aspect-[4/3] bg-gray-800/60 mt-1">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="football" size={40} color="#ffffff" />
          </View>
        )}
      </View>
      <Text
        className="text-white text-xs text-right px-3 py-2"
        style={{ fontFamily: "Meem-Regular" }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function ActiveItemsCards({
  stadium,
  mentor,
  onPressStadium,
  onPressMentor,
}: ActiveItemsCardsProps) {
  return (
    <View className="flex-row gap-3">
      <SingleItemCard
        item={stadium}
        fallbackLabel="استادیوم"
        onPress={onPressStadium}
      />
      <SingleItemCard
        item={mentor}
        fallbackLabel="منتور"
        onPress={onPressMentor}
      />
    </View>
  );
}

