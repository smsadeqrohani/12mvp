import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "../../../components/ui";

export interface DashboardHeaderCardProps {
  userName: string;
  avatarId?: string | null;
  onChangeAvatar: () => void;
  onChangeUsername?: () => void;
}

export function DashboardHeaderCard({
  userName,
  avatarId,
  onChangeAvatar,
  onChangeUsername,
}: DashboardHeaderCardProps) {
  return (
    <View className="bg-background-light rounded-2xl border border-gray-700/30 p-4 flex-row items-center justify-between">
      <View className="flex-1 items-end">
        <Text
          className="text-white text-xl font-bold text-right"
          style={{ fontFamily: "Meem-Bold" }}
          numberOfLines={1}
        >
          {userName}
        </Text>
        <TouchableOpacity onPress={onChangeAvatar} activeOpacity={0.7} className="mt-1">
          <Text
            className="text-accent text-sm"
            style={{ fontFamily: "Meem-Regular" }}
          >
            تغییر اواتار
          </Text>
        </TouchableOpacity>
        {onChangeUsername && (
          <TouchableOpacity onPress={onChangeUsername} activeOpacity={0.7} className="mt-0.5">
            <Text
              className="text-gray-400 text-sm"
              style={{ fontFamily: "Meem-Regular" }}
            >
              تغییر نام
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={onChangeAvatar} activeOpacity={0.8} className="mr-3">
        <Avatar avatarId={avatarId} size="xl" />
      </TouchableOpacity>
    </View>
  );
}
