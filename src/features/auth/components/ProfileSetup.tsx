import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "../../../lib/toast";
import { useRouter } from "expo-router";
import { KeyboardAvoidingContainer } from "../../../components/ui";

export function ProfileSetup() {
  const createProfile = useMutation(api.auth.createProfile);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    setLoading(true);

    createProfile({ name })
      .then(() => {
        toast.success("پروفایل ایجاد شد!");
        router.replace("/");
      })
      .catch((error) => {
        console.error(error);
        toast.error("نمی‌توان پروفایل ایجاد کرد");
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingContainer className="flex-1 justify-center p-5">
        <View className="max-w-md w-full mx-auto">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="bg-accent/20 rounded-full p-6 mb-6">
              <Text className="text-5xl">👤</Text>
            </View>
            <Text className="text-4xl font-bold text-accent mb-3 text-center">
              پروفایل خود را تکمیل کنید
            </Text>
            <Text className="text-lg text-gray-300 text-center">
              چطور شما را صدا کنیم؟
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-background-light rounded-2xl p-6 border border-gray-700 shadow-lg">
            <View className="flex flex-col gap-4">
              <View>
                <Text className="text-gray-300 mb-2 font-medium">نام شما</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="auth-input-field"
                  placeholder="نام و نام خانوادگی"
                  placeholderTextColor="#6b7280"
                  editable={!loading}
                  autoFocus
                />
              </View>
              <TouchableOpacity onPress={handleSubmit} className="auth-button mt-2" disabled={loading}>
                {loading ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-semibold text-base">در حال ایجاد پروفایل...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">ادامه</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingContainer>
    </SafeAreaView>
  );
}
