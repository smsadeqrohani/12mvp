import { SafeAreaView } from "react-native";
import { ProfileSetup } from "../../src/features/auth";

export default function ProfileSetupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ProfileSetup />
    </SafeAreaView>
  );
}
