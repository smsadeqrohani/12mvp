import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { SignOutButton } from "../../../features/auth";

export function HelloPage() {
  const userProfile = useQuery(api.auth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (!userProfile || !loggedInUser) {
    return (
      <View className="flex justify-center items-center p-8">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  return (
    <View className="p-4 space-y-6">
      <View className="items-center">
        <Text className="text-4xl font-bold text-accent mb-4">
          سلام، {userProfile.name}! 👋
        </Text>
        <Text className="text-lg text-gray-300">
          به داشبورد خود خوش آمدید
        </Text>
      </View>
      
      <View className="bg-background-light rounded-lg p-6 border border-gray-600">
        <Text className="text-xl font-semibold mb-4 text-white text-right">حساب شما</Text>
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
        </View>
      </View>

      <View className="bg-accent/20 rounded-lg p-6 border border-accent/30">
        <Text className="text-lg font-semibold text-accent mb-2 text-right">🎉 همه چیز آماده است!</Text>
        <Text className="text-gray-300 text-right leading-6">
          حساب شما با موفقیت ایجاد شد. اکنون می‌توانید از برنامه استفاده کنید.
        </Text>
      </View>

      <View className="items-center mt-4">
        <SignOutButton />
      </View>
    </View>
  );
}
