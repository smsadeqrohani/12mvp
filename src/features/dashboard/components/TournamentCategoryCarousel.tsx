import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Trophy } from "lucide-react-native";
import { Id } from "../../../../convex/_generated/dataModel";

export interface TournamentCategoryItem {
  id: Id<"categories">;
  title: string;
  multiplierLabel: string;
  imageUrl?: string | null;
  wins: number;
}

export interface TournamentCategoryCarouselProps {
  items: TournamentCategoryItem[];
  onCategoryPress?: (id: Id<"categories">) => void;
}

const TROPHY_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#5C92FF", "#FF7B14"];

export function TournamentCategoryCarousel({
  items,
  onCategoryPress,
}: TournamentCategoryCarouselProps) {
  if (items.length === 0) {
    return (
      <View className="py-3">
        <Text className="text-gray-400 text-sm text-right" style={{ fontFamily: "Meem-Regular" }}>
          دسته‌بندی تورنومنت‌ها
        </Text>
        <Text className="text-gray-500 text-sm text-right mt-2" style={{ fontFamily: "Meem-Regular" }}>
          هیچ دسته‌ای یافت نشد
        </Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      <FlatList
        data={items}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
        renderItem={({ item, index }) => {
          const color = TROPHY_COLORS[index % TROPHY_COLORS.length];
          return (
            <TouchableOpacity
              onPress={() => onCategoryPress?.(item.id)}
              activeOpacity={0.8}
              className="items-center ml-3"
              style={{ width: 72 }}
            >
              <View
                className="w-14 h-14 rounded-xl items-center justify-center border border-gray-600/50 bg-gray-800/50"
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-10 h-10 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <Trophy size={28} color={color} strokeWidth={2} />
                )}
              </View>
              <Text
                className="text-yellow-400 text-xs mt-1 font-semibold text-center"
                style={{ fontFamily: "Meem-SemiBold" }}
                numberOfLines={1}
              >
                {item.multiplierLabel}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
