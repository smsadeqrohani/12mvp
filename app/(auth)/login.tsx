import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from "react-native";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useQuery } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SignInForm, SignUpForm } from "../../src/features/auth";
import { api } from "../../convex/_generated/api";

const authBackground = require("../../assets/background.png");

// YekDo login design - Figma node 320-605
// width: 390px, height: 844px
// background: var(--blue-blue-900, #07193D)

export default function LoginScreen() {
  const { referralCode: urlReferralCode, mode } = useLocalSearchParams<{
    referralCode?: string;
    mode?: string;
  }>();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);

  useEffect(() => {
    if (loggedInUser && userProfile === null) {
      router.replace("/(auth)/profile-setup");
    } else if (loggedInUser && userProfile) {
      router.replace("/(tabs)");
    }
  }, [loggedInUser, userProfile, router]);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <ImageBackground
        source={authBackground}
        style={{ flex: 1, width: "100%", height: "auto" }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 24,
            justifyContent: "center",
            alignItems: "center",
            minHeight: SCREEN_HEIGHT - 48,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Login card - centered vertically and horizontally */}
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#073BA3",
              backgroundColor: "rgba(7, 25, 61, 0.72)",
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 28,
              alignSelf: "center",
              overflow: "hidden",
              // @ts-expect-error - backdrop-filter for web
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Welcome message */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#ffffff",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {isSignUp ? "باشگاه جدید بسازید" : "به یک دو خوش آمدید!"}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#9ca3af",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              {isSignUp
                ? "حساب کاربری خود را ایجاد کنید"
                : "برای رفتن به باشگاه وارد شوید"}
            </Text>

            {/* Form */}
            {isSignUp ? (
              <SignUpForm initialReferralCode={urlReferralCode} />
            ) : (
              <SignInForm />
            )}

            {/* Secondary toggle link */}
            <View className="items-center mt-5">
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                className="py-2 px-4"
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    textAlign: "center",
                  }}
                >
                  {isSignUp ? (
                    <>
                      <Text>قبلاً حساب دارید؟ </Text>
                      <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                        وارد شوید
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text>حساب کاربری ندارید؟ </Text>
                      <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                        ساخت باشگاه جدید
                      </Text>
                    </>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer - terms */}
          <View className="items-center mt-6 pt-4">
            <Text
              style={{
                fontSize: 12,
                color: "#9ca3af",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              با ورود به برنامه، شرایط و قوانین را می‌پذیرید
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
