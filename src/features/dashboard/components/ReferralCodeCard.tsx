import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ReferralCodeCardProps {
  code: string;
  onCopy: () => void;
  onShare: () => void;
  hint?: string;
}

export function ReferralCodeCard({ code, onCopy, onShare, hint }: ReferralCodeCardProps) {
  return (
    <View className="bg-background-light rounded-2xl border border-gray-700/30 p-4">
      <Text
        className="text-white text-lg font-semibold text-right mb-3"
        style={{ fontFamily: "Meem-SemiBold" }}
      >
        کد معرف
      </Text>
      <View className="bg-gray-800/80 rounded-xl py-3 px-4 mb-3">
        <Text
          className="text-white text-xl font-bold text-center tracking-widest"
          style={{ fontFamily: "Meem-Bold" }}
        >
          {code}
        </Text>
      </View>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCopy}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-gray-700 rounded-xl"
        >
          <Ionicons name="copy-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
            کپی
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onShare}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-accent rounded-xl"
        >
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text className="text-white font-semibold" style={{ fontFamily: "Meem-SemiBold" }}>
            اشتراک گذاری
          </Text>
        </TouchableOpacity>
      </View>
      {hint ? (
        <View className="flex-row items-center mt-3 gap-2">
          <Text
            className="text-gray-400 text-sm flex-1 text-right"
            style={{ fontFamily: "Meem-Regular" }}
          >
            {hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
