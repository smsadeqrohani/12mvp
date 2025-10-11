import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "../ui/Button";

interface WaitingScreenProps {
  onCancel: () => void;
}

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  return (
    <View className="w-full px-6 py-8">
      <View className="max-w-2xl mx-auto">
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-8 items-center">
          <ActivityIndicator size="large" color="#ff701a" className="mb-6" />
          <Text className="text-2xl font-bold text-white mb-4">
            منتظر حریف...
          </Text>
          <Text className="text-gray-300 mb-6 text-center">
            منتظر بمانید تا حریف دیگری به مسابقه بپیوندد
          </Text>
          <Text className="text-gray-400 mb-6 text-sm text-center">
            وقتی حریف پیدا شد، مسابقه به طور خودکار شروع می‌شود
          </Text>
          <Button
            onPress={onCancel}
            variant="danger"
          >
            لغو مسابقه
          </Button>
        </View>
      </View>
    </View>
  );
}

