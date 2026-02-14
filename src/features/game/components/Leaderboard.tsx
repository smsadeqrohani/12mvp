import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar } from "../../../components/ui";

export function Leaderboard() {
  const topUsers = useQuery(api.auth.getTopUsers, { limit: 20 });

  return (
    <View className="flex-1 p-4">
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text
          className="text-xl font-semibold mb-4 text-white text-right"
          style={{ fontFamily: "Vazirmatn-SemiBold" }}
        >
          🏆 جدول برترین‌ها
        </Text>
        {topUsers === undefined ? (
          <View className="flex items-center justify-center py-12">
            <ActivityIndicator size="large" color="#FF7B14" />
          </View>
        ) : topUsers.length === 0 ? (
          <Text
            className="text-gray-400 text-right py-8"
            style={{ fontFamily: "Vazirmatn-Regular" }}
          >
            هنوز کاربری با پاسخ درست وجود ندارد
          </Text>
        ) : (
          <View className="space-y-3">
            {topUsers.map((user, index) => (
              <View
                key={user.rank}
                className={`flex-row items-center justify-between p-3 rounded-lg border ${
                  index === 0
                    ? "bg-yellow-400/20 border-yellow-400/50"
                    : index === 1
                      ? "bg-yellow-900/20 border-yellow-800/50"
                      : index === 2
                        ? "bg-orange-900/20 border-orange-800/50"
                        : "bg-background border-gray-700"
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar avatarId={user.avatarId} size="sm" highlighted={index === 0} />
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      index === 0
                        ? "bg-yellow-400"
                        : index === 1
                          ? "bg-yellow-600"
                          : index === 2
                            ? "bg-orange-600"
                            : "bg-gray-600"
                    }`}
                  >
                    <Text
                      className="text-white font-bold text-sm"
                      style={{ fontFamily: "Vazirmatn-Bold" }}
                    >
                      {user.rank}
                    </Text>
                  </View>
                  <Text
                    className="text-white font-medium flex-1 text-right"
                    style={{ fontFamily: "Vazirmatn-SemiBold" }}
                  >
                    {user.name}
                  </Text>
                </View>
                <View className="bg-yellow-400/20 rounded-lg px-3 py-1 border border-yellow-400/30">
                  <Text
                    className="text-yellow-400 font-bold"
                    style={{ fontFamily: "Vazirmatn-Bold" }}
                  >
                    {user.correctAnswers.toLocaleString("fa-IR")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
