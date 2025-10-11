"use client";
import { TouchableOpacity, Text, View } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { toast } from "../../../lib/toast";
import { Ionicons } from "@expo/vector-icons";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableOpacity
      className="flex-row items-center gap-2 px-6 py-3 rounded-lg bg-red-900/20 border border-red-500/30"
      onPress={() => {
        void signOut()
          .then(() => {
            toast.success("با موفقیت خارج شدید");
          })
          .catch((error) => {
            toast.error("خطا در خروج از حساب کاربری");
            console.error("Sign out error:", error);
          });
      }}
      activeOpacity={0.7}
    >
      <Text className="text-red-400 font-semibold text-base">خروج از حساب</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#ef4444" />
    </TouchableOpacity>
  );
}
