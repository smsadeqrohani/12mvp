import { View, Text } from "react-native";
import { Gamepad2, Trophy } from "lucide-react-native";
import { COLORS } from "../../../lib/colors";

export interface QuotaUsageCardProps {
  createdGames: number;
  createdGamesLimit: number;
  createdTournaments: number;
  createdTournamentsLimit: number;
  resetHintText?: string;
}

export function QuotaUsageCard({
  createdGames,
  createdGamesLimit,
  createdTournaments,
  createdTournamentsLimit,
  resetHintText,
}: QuotaUsageCardProps) {
  return (
    <View className="bg-background-light rounded-2xl border border-gray-700/30 p-4">
      <Text
        className="text-white text-lg font-semibold text-right mb-4"
        style={{ fontFamily: "Meem-SemiBold" }}
      >
        وضعیت باشگاه
      </Text>
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Gamepad2 size={20} color={COLORS.yellow[400]} strokeWidth={2} />
            <View>
              <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
                {createdGames.toLocaleString("fa-IR")} بازی
              </Text>
              <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
                بازی های ایجاد شده
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            {createdGames.toLocaleString("fa-IR")} / {createdGamesLimit.toLocaleString("fa-IR")}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Trophy size={20} color={COLORS.yellow[400]} strokeWidth={2} />
            <View>
              <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
                {createdTournaments.toLocaleString("fa-IR")} تورنومنت
              </Text>
              <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
                تورنومنت های ایجاد شده
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            {createdTournaments.toLocaleString("fa-IR")} / {createdTournamentsLimit.toLocaleString("fa-IR")}
          </Text>
        </View>
      </View>
      {resetHintText ? (
        <Text
          className="text-gray-500 text-sm text-right mt-3"
          style={{ fontFamily: "Meem-Regular" }}
        >
          {resetHintText}
        </Text>
      ) : null}
    </View>
  );
}
