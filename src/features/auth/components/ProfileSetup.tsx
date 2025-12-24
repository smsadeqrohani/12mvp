import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "../../../lib/toast";
import { useRouter } from "expo-router";
import { Avatar, KeyboardAvoidingContainer } from "../../../components/ui";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID, isFreeAvatar, isPremiumAvatar } from "../../../../shared/avatarOptions";
import { Ionicons } from "@expo/vector-icons";

export function ProfileSetup() {
  const createProfile = useMutation(api.auth.createProfile);
  const ownedAvatars = useQuery(api.store.getUserOwnedAvatars);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(DEFAULT_AVATAR_ID);
  const router = useRouter();
  const isFormValid = name.trim().length > 0;

  // Check if user can select an avatar (free or owned)
  const canSelectAvatar = (avatarId: string) => {
    if (isFreeAvatar(avatarId)) return true;
    if (isPremiumAvatar(avatarId) && ownedAvatars) {
      return ownedAvatars.includes(avatarId);
    }
    return false;
  };

  const handleSubmit = () => {
    setLoading(true);

    createProfile({ name, avatarId: selectedAvatarId })
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
                <Text className="text-gray-300 mb-2 font-medium">انتخاب آواتار</Text>
                <View className="flex-row flex-wrap gap-3">
                  {AVATAR_OPTIONS.map((option) => {
                    const isSelected = option.id === selectedAvatarId;
                    const canSelect = canSelectAvatar(option.id);
                    const isOwned = ownedAvatars?.includes(option.id);
                    const isPremium = isPremiumAvatar(option.id);
                    
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => {
                          if (canSelect) {
                            setSelectedAvatarId(option.id);
                          } else {
                            toast.error("این آواتار را باید از فروشگاه خریداری کنید");
                          }
                        }}
                        activeOpacity={canSelect ? 0.8 : 0.5}
                        disabled={!canSelect}
                      >
                        <View className="relative">
                          <Avatar
                            avatarId={option.id}
                            size="md"
                            highlighted={isSelected}
                            className={!canSelect ? "opacity-50" : ""}
                            badge={
                              isSelected ? (
                                <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                                  <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                              ) : isPremium && !isOwned ? (
                                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 items-center justify-center border border-gray-600">
                                  <Ionicons name="lock-closed" size={12} color="#9ca3af" />
                                </View>
                              ) : undefined
                            }
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {ownedAvatars && ownedAvatars.length > 0 && (
                  <Text className="text-gray-400 text-xs mt-2 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                    آواتارهای قفل‌شده را می‌توانید از فروشگاه خریداری کنید
                  </Text>
                )}
              </View>

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
              <TouchableOpacity
                onPress={handleSubmit}
                className={`auth-button mt-2 ${(!isFormValid || loading) ? "opacity-60" : ""}`}
                disabled={!isFormValid || loading}
              >
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
