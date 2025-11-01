import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SignOutButton } from "../../../features/auth";

export function HelloPage() {
  const userProfile = useQuery(api.auth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const topUsers = useQuery(api.auth.getTopUsers, { limit: 5 });

  if (!userProfile || !loggedInUser) {
    return (
      <View className="flex justify-center items-center p-8">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 space-y-6">
      <View className="items-center">
        <Text className="text-4xl font-bold text-accent mb-4" style={{ fontFamily: 'Vazirmatn-Bold' }}>
          سلام، {userProfile.name}! 👋
        </Text>
        <Text className="text-lg text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          به داشبورد خود خوش آمدید
        </Text>
      </View>
      
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>حساب شما</Text>
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-right flex-1">{userProfile.name}</Text>
            <Text className="font-medium text-gray-300 ml-3">نام:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-right flex-1">{loggedInUser.email}</Text>
            <Text className="font-medium text-gray-300 ml-3">ایمیل:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-right flex-1">
              {new Date(loggedInUser._creationTime).toLocaleDateString('fa-IR')}
            </Text>
            <Text className="font-medium text-gray-300 ml-3">عضو از:</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-accent text-xl font-bold text-right flex-1">
              {(userProfile.points ?? 0).toLocaleString('fa-IR')}
            </Text>
            <Text className="font-medium text-gray-300 ml-3">امتیاز:</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard */}
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text className="text-xl font-semibold mb-4 text-white text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
          🏆 جدول برترین‌ها
        </Text>
        {topUsers === undefined ? (
          <View className="flex items-center justify-center py-8">
            <ActivityIndicator size="small" color="#ff701a" />
          </View>
        ) : topUsers.length === 0 ? (
          <Text className="text-gray-400 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            هنوز کاربری با امتیاز وجود ندارد
          </Text>
        ) : (
          <View className="space-y-3">
            {topUsers.map((user, index) => (
              <View
                key={user.rank}
                className={`flex-row items-center justify-between p-3 rounded-lg border ${
                  index === 0
                    ? "bg-accent/20 border-accent/50"
                    : index === 1
                    ? "bg-yellow-900/20 border-yellow-800/50"
                    : index === 2
                    ? "bg-orange-900/20 border-orange-800/50"
                    : "bg-background border-gray-700"
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${
                    index === 0
                      ? "bg-accent"
                      : index === 1
                      ? "bg-yellow-600"
                      : index === 2
                      ? "bg-orange-600"
                      : "bg-gray-600"
                  }`}>
                    <Text className={`text-white font-bold text-sm ${
                      index < 3 ? "text-white" : "text-gray-300"
                    }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                      {user.rank}
                    </Text>
                  </View>
                  <Text className="text-white font-medium flex-1 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                    {user.name}
                  </Text>
                </View>
                <View className="bg-accent/20 rounded-lg px-3 py-1 border border-accent/30">
                  <Text className="text-accent font-bold" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                    {user.points.toLocaleString('fa-IR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="bg-accent/20 rounded-lg p-6 border border-accent/30">
        <Text className="text-lg font-semibold text-accent mb-2 text-right" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>🎉 همه چیز آماده است!</Text>
        <Text className="text-gray-300 text-right leading-6" style={{ fontFamily: 'Vazirmatn-Regular' }}>
          حساب شما با موفقیت ایجاد شد. اکنون می‌توانید از برنامه استفاده کنید.
        </Text>
      </View>

      <View className="items-center mt-4">
        <SignOutButton />
      </View>
    </View>
  );
}
