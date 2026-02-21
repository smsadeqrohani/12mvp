import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Crown, Trophy, Gamepad2, ShoppingBag, Shirt } from "lucide-react-native";
import { toast } from "../../src/lib/toast";
import { COLORS } from "../../src/lib/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
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
      initialRouteName="leaderboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.blue[900],
        },
        headerTintColor: COLORS.yellow[400],
        headerTitleStyle: {
          fontFamily: "Meem-Bold",
          fontSize: 20,
        },
        headerTitleAlign: "center",
        tabBarStyle: {
          backgroundColor: COLORS.navbar.background,
          borderTopColor: "rgba(148, 163, 184, 0.2)",
          direction: "rtl",
          paddingBottom: insets.bottom || 16,
          height: 64 + (insets.bottom || 16),
        },
        tabBarLabelStyle: {
          fontFamily: "Meem-SemiBold",
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarActiveTintColor: COLORS.navbar.active,
        tabBarInactiveTintColor: COLORS.navbar.inactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "باشگاه",
          tabBarIcon: ({ color, size }) => (
            <Shirt size={size} color={color} strokeWidth={2} />
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-3 mr-4">
              {userProfile?.isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push("/admin")}
                  className="flex-row items-center gap-2"
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={COLORS.yellow[400]}
                  />
                  <Text
                    style={{
                      color: COLORS.yellow[400],
                      fontFamily: "Meem-SemiBold",
                    }}
                  >
                    پنل مدیریت
                  </Text>
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
        name="store"
        options={{
          title: "فروشگاه",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-match"
        options={{
          title: "بازی",
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: "جام",
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "جدول",
          tabBarIcon: ({ color, size }) => (
            <Crown size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "تاریخچه",
          href: null,
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: "بازی",
          href: null,
        }}
      />
      <Tabs.Screen
        name="results/[id]"
        options={{
          title: "نتایج",
          href: null,
        }}
      />
    </Tabs>
  );
}
