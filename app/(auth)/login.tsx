import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { VideoBackground } from "../../src/components/ui";
import { COLORS } from "../../src/lib/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useQuery } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SignInForm, SignUpForm } from "../../src/features/auth";
import { api } from "../../convex/_generated/api";

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
      <VideoBackground />
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
          {/* Login card - design: 358px, gap 40, blur, blue border */}
          <View
            style={{
              width: 358,
              maxWidth: "100%",
              padding: 24,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.blue[700],
              backgroundColor: "rgba(7, 25, 61, 0.72)",
              ...(Platform.OS === "web" && {
                backdropFilter: "blur(12px)",
              } as Record<string, unknown>),
              alignSelf: "center",
            }}
          >
            {/* Welcome message */}
            <View style={{ alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  fontFamily: "Meem-Bold",
                  fontSize: 24,
                  color: COLORS.neutral[100],
                  textAlign: "center",
                }}
              >
                {isSignUp ? "باشگاه جدید بسازید" : "به یک دو خوش آمدید!"}
              </Text>
              <Text
                style={{
                  fontFamily: "Meem-Regular",
                  fontSize: 15,
                  color: COLORS.neutral[300],
                  textAlign: "center",
                }}
              >
                {isSignUp
                  ? "حساب کاربری خود را ایجاد کنید"
                  : "برای رفتن به باشگاه وارد شوید"}
              </Text>
            </View>

            {/* Form */}
            {isSignUp ? (
              <SignUpForm initialReferralCode={urlReferralCode} />
            ) : (
              <SignInForm />
            )}

            {/* Secondary toggle link */}
            <View className="items-center">
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                className="py-2 px-4"
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: "Meem-Regular",
                    fontSize: 14,
                    color: COLORS.neutral[300],
                    textAlign: "center",
                  }}
                >
                  {isSignUp ? (
                    <>
                      <Text style={{ fontFamily: "Meem-Regular" }}>قبلاً حساب دارید؟ </Text>
                      <Text style={{ fontFamily: "Meem-Bold", color: COLORS.yellow[500] }}>
                        وارد شوید
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontFamily: "Meem-Regular" }}>حساب کاربری ندارید؟ </Text>
                      <Text style={{ fontFamily: "Meem-Bold", color: COLORS.yellow[500] }}>
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
                fontFamily: "Meem-Regular",
                fontSize: 12,
                color: COLORS.neutral[300],
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              با ورود به برنامه، شرایط و قوانین را می‌پذیرید
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
