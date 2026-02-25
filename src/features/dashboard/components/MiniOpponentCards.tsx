import { View, Text, Image, TouchableOpacity } from "react-native";

export interface MiniOpponentItem {
  id: string;
  title: string;
  imageUrl?: string | null;
}

export interface MiniOpponentCardsProps {
  items: MiniOpponentItem[];
  onPress?: (id: string) => void;
}

export function MiniOpponentCards({ items, onPress }: MiniOpponentCardsProps) {
  if (items.length === 0) return null;

  return (
    <View className="flex-row gap-3">
      {items.slice(0, 2).map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => onPress?.(item.id)}
          activeOpacity={0.8}
          className="flex-1 bg-background-light rounded-2xl border border-gray-700/30 overflow-hidden"
        >
          <Text
            className="text-white font-semibold text-right p-2"
            style={{ fontFamily: "Meem-SemiBold" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View className="aspect-[4/3] bg-gray-800/50">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500 text-xs" style={{ fontFamily: "Meem-Regular" }}>
                  بدون تصویر
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
