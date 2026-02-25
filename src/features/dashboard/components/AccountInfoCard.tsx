import { View, Text, TouchableOpacity } from "react-native";

export interface AccountInfoCardProps {
  name: string;
  email: string;
  membershipDate: string;
  onChangeName: () => void;
  onChangeEmail: () => void;
  onSignOut: () => void;
}

export function AccountInfoCard({
  name,
  email,
  membershipDate,
  onChangeName,
  onChangeEmail,
  onSignOut,
}: AccountInfoCardProps) {
  return (
    <View className="bg-background-light rounded-2xl border border-gray-700/30 p-4">
      <Text
        className="text-white text-lg font-semibold text-right mb-4"
        style={{ fontFamily: "Meem-SemiBold" }}
      >
        حساب شما
      </Text>
      <View className="gap-3">
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={onChangeName} activeOpacity={0.7}>
              <Text className="text-accent text-sm" style={{ fontFamily: "Meem-Regular" }}>
                تغییرنام
              </Text>
            </TouchableOpacity>
            <Text className="text-white text-right flex-1" numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            نام:
          </Text>
        </View>
        <View className="flex-row items-center justify-between flex-wrap gap-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={onChangeEmail} activeOpacity={0.7}>
              <Text className="text-accent text-sm" style={{ fontFamily: "Meem-Regular" }}>
                تغییرایمیل
              </Text>
            </TouchableOpacity>
            <Text className="text-white text-right flex-1" numberOfLines={1}>
              {email}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            ایمیل:
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-right flex-1">{membershipDate}</Text>
          <Text className="text-gray-400 text-sm" style={{ fontFamily: "Meem-Regular" }}>
            تاریخ عضویت:
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onSignOut}
        activeOpacity={0.7}
        className="mt-4 py-3 bg-gray-700 rounded-xl items-center justify-center"
      >
        <Text className="text-gray-200 font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
          خروج از حساب
        </Text>
      </TouchableOpacity>
    </View>
  );
}
