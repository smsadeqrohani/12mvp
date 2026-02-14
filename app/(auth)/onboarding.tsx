import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

// YekDo onboarding - Figma node 325-788
// Same background as login, prominent CTA button

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/login-background.png")}
      style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
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
        {/* Logo / Brand */}
        <Text
          style={{
            fontSize: 36,
            fontWeight: "800",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 24,
            textShadowColor: "rgba(0,0,0,0.5)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          یک‌دو
        </Text>

        {/* CTA Button - bright yellow/golden */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#FACC15",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
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
  );
}
