import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

const authBackground = require("../../assets/background.png");

// YekDo onboarding - Figma node 325-788
// Same background as login, prominent CTA button

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <ImageBackground
        source={authBackground}
        style={{ flex: 1, width: "100%", height: "auto" }}
        resizeMode="cover"
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            paddingHorizontal: 24,
            justifyContent: "flex-end",
            paddingBottom: 48,
          }}
        >
        {/* CTA Button - Figma design: height 64px, yellow-500, 3D shadow */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
          style={{
            height: 64,
            paddingVertical: 12,
            paddingStart: 64,
            paddingEnd: 60,
            borderRadius: 12,
            backgroundColor: "#EAB308",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            // 3D raised: box-shadow 0 -4px 0 0 (darker yellow edge)
            shadowColor: "#CA8A04",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#1a1a1a",
            }}
          >
            وارد رختکن شو
          </Text>
        </TouchableOpacity>

        {/* Tagline */}
        <Text
          style={{
            fontSize: 14,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 22,
            opacity: 0.95,
          }}
        >
          هر برد، تو رو به صدر جدول نزدیک‌تر میکنه!
        </Text>
      </View>
      </ImageBackground>
    </View>
  );
}
