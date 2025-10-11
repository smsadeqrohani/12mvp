import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "../../src/lib/toast";

export default function TabsLayout() {
  const userProfile = useQuery(api.auth.getUserProfile);
  const router = useRouter();
  const { signOut } = useAuthActions();

  const handleSignOut = () => {
    void signOut()
      .then(() => {
        toast.success("با موفقیت خارج شدید");
      })
      .catch((error) => {
        toast.error("خطا در خروج از حساب کاربری");
        console.error("Sign out error:", error);
      });
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0a2840",
        },
        headerTintColor: "#ff701a",
        headerTitleStyle: {
          fontFamily: "Vazirmatn-Bold",
          fontSize: 20,
        },
        headerTitleAlign: "center",
        tabBarStyle: {
          backgroundColor: "#0a2840",
          borderTopColor: "#374151",
          direction: "rtl",
        },
        tabBarActiveTintColor: "#ff701a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontFamily: "Vazirmatn-SemiBold",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد",
          headerRight: () => (
            <View className="flex-row items-center gap-3 mr-4">
              {userProfile?.isAdmin && (
                <TouchableOpacity 
                  onPress={() => router.push("/admin")}
                  className="flex-row items-center gap-2"
                >
                  <Ionicons name="chevron-forward-outline" size={16} color="#ff701a" />
                  <Text className="text-accent font-semibold">پنل مدیریت</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="new-match"
        options={{
          title: "مسابقه جدید",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "تاریخچه",
        }}
      />
    </Tabs>
  );
}

