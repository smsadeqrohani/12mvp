import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "../../../lib/toast";
import { useRouter } from "expo-router";
import { Avatar, KeyboardAvoidingContainer } from "../../../components/ui";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID, isFreeAvatar, isPremiumAvatar } from "../../../../shared/avatarOptions";
import { Ionicons } from "@expo/vector-icons";
import { getStorageItem, removeStorageItem } from "../../../lib/storage";

export function ProfileSetup() {
  const createProfile = useMutation(api.auth.createProfile);
  const ownedAvatars = useQuery(api.store.getUserOwnedAvatars);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const router = useRouter();
  const isFormValid = name.trim().length > 0;

  // Load referral code from storage on mount
  useEffect(() => {
    const loadReferralCode = async () => {
      const code = await getStorageItem<string | null>("pending_referral_code", null);
      if (code) {
        setReferralCode(code);
      }
    };
    loadReferralCode();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await createProfile({ 
        name, 
        avatarId: selectedAvatarId,
        referralCode: referralCode || undefined,
      });
      
      // Clear the referral code from storage after successful profile creation
      if (referralCode) {
        await removeStorageItem("pending_referral_code");
      }
      
      toast.success("پروفایل ایجاد شد!");
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("نمی‌توان پروفایل ایجاد کرد");
    } finally {
      setLoading(false);
    }
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
                  {AVATAR_OPTIONS.filter((option) => {
                    // Show free avatars always
                    if (isFreeAvatar(option.id)) return true;
                    // Show premium avatars only if user owns them
                    if (isPremiumAvatar(option.id)) {
                      return ownedAvatars?.includes(option.id) ?? false;
                    }
                    return false;
                  }).map((option) => {
                    const isSelected = option.id === selectedAvatarId;
                    
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => setSelectedAvatarId(option.id)}
                        activeOpacity={0.8}
                      >
                        <View className="relative">
                          <Avatar
                            avatarId={option.id}
                            size="md"
                            highlighted={isSelected}
                            badge={
                              isSelected ? (
                                <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                                  <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                              ) : undefined
                            }
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text className="text-gray-400 text-xs mt-2 text-right" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                  آواتارهای ویژه را می‌توانید از فروشگاه خریداری کنید
                </Text>
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
