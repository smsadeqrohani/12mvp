import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { toast } from "../../../lib/toast";
import { useRouter } from "expo-router";
import { setStorageItem } from "../../../lib/storage";

interface SignUpFormProps {
  initialReferralCode?: string;
}

export function SignUpForm({ initialReferralCode }: SignUpFormProps = {} as SignUpFormProps) {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(initialReferralCode?.toUpperCase().trim() || "");
  const router = useRouter();
  
  // Update referral code if initialReferralCode changes (e.g., from URL params)
  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode.toUpperCase().trim());
    }
  }, [initialReferralCode]);

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("رمز عبور باید حداقل ۸ کاراکتر باشد");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد");
    }
    
    if (!/\d/.test(password)) {
      errors.push("رمز عبور باید حداقل یک عدد داشته باشد");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("رمز عبور باید حداقل یک کاراکتر ویژه (!@#$%^&*...) داشته باشد");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      toast.error("رمز عبور معیارهای امنیتی را برآورده نمی‌کند");
      setLoading(false);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast.error("رمزهای عبور مطابقت ندارند");
      setLoading(false);
      return;
    }

    // Clear any previous errors
    setPasswordErrors([]);

    // Store referral code if provided (for use in profile setup)
    if (referralCode.trim()) {
      await setStorageItem("pending_referral_code", referralCode.trim().toUpperCase());
    }

    signIn("password", { email, password, flow: "signUp" })
      .then(() => {
        router.replace("/");
      })
      .catch((error) => {
        console.error(error);
        toast.error("نمی‌توان حساب ایجاد کرد");
      })
      .finally(() => setLoading(false));
  };

  return (
    <View className="w-full">
      <View className="flex flex-col gap-4">
        {/* Email Field */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">ایمیل</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="example@email.com"
            placeholderTextColor="#6b7280"
            className="auth-input-field"
            editable={!loading}
            autoCapitalize="none"
          />
        </View>

        {/* Password Requirements Info */}
        <View className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <Text className="text-blue-400 text-sm font-semibold mb-2">معیارهای رمز عبور:</Text>
          <View className="space-y-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-blue-400">•</Text>
              <Text className="text-blue-300 text-sm">حداقل ۸ کاراکتر</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-blue-400">•</Text>
              <Text className="text-blue-300 text-sm">یک حرف بزرگ انگلیسی</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-blue-400">•</Text>
              <Text className="text-blue-300 text-sm">یک حرف کوچک انگلیسی</Text>
            </View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-blue-400">•</Text>
              <Text className="text-blue-300 text-sm">یک عدد</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-blue-400">•</Text>
              <Text className="text-blue-300 text-sm">یک کاراکتر ویژه (!@#$%^&*...)</Text>
            </View>
          </View>
        </View>

        {/* Password Field */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">رمز عبور</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (text.length > 0) {
                const errors = validatePassword(text);
                setPasswordErrors(errors);
              } else {
                setPasswordErrors([]);
              }
            }}
            secureTextEntry
            placeholder="رمز عبور خود را وارد کنید"
            placeholderTextColor="#6b7280"
            className="auth-input-field"
            editable={!loading}
          />
        </View>

        {passwordErrors.length > 0 && (
          <View className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <Text className="text-red-400 text-sm font-semibold mb-2">رمز عبور باید شامل موارد زیر باشد:</Text>
            <View className="space-y-1">
              {passwordErrors.map((error, index) => (
                <View key={index} className="flex-row items-center gap-2 mb-1">
                  <Text className="text-red-400">•</Text>
                  <Text className="text-red-300 text-sm">{error}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirm Password Field */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">تأیید رمز عبور</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="رمز عبور را دوباره وارد کنید"
            placeholderTextColor="#6b7280"
            className="auth-input-field"
            editable={!loading}
          />
        </View>

        {/* Referral Code Field (Optional) */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">کد معرف (اختیاری)</Text>
          <TextInput
            value={referralCode}
            onChangeText={(text) => setReferralCode(text.toUpperCase().trim())}
            placeholder="کد معرف را وارد کنید"
            placeholderTextColor="#6b7280"
            className="auth-input-field"
            editable={!loading}
            autoCapitalize="characters"
            maxLength={8}
          />
          <Text className="text-gray-500 text-xs mt-1 text-right">
            اگر کد معرف دارید، آن را وارد کنید
          </Text>
        </View>

        <TouchableOpacity onPress={handleSubmit} className="auth-button mt-2" disabled={loading}>
          {loading ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold text-base">در حال ایجاد حساب...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-base">ثبت نام</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
