import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
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
        {/* Email Field - YekDo design */}
        <View>
          <Text style={authStyles.label}>ایمیل</Text>
          <TextInput
            style={authStyles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="ایمیل خود را وارد کنید"
            placeholderTextColor="#9ca3af"
            editable={!loading}
            autoCapitalize="none"
          />
        </View>

        {/* Password Requirements Info - YekDo blue theme */}
        <View style={authStyles.requirementsBox}>
          <Text style={authStyles.requirementsTitle}>معیارهای رمز عبور:</Text>
          <View className="space-y-1">
            {[
              "حداقل ۸ کاراکتر",
              "یک حرف بزرگ انگلیسی",
              "یک حرف کوچک انگلیسی",
              "یک عدد",
              "یک کاراکتر ویژه (!@#$%^&*...)",
            ].map((item, i) => (
              <View key={i} className="flex-row items-center gap-2 mb-1">
                <Text style={authStyles.requirementsBullet}>•</Text>
                <Text style={authStyles.requirementsText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Password Field */}
        <View>
          <Text style={authStyles.label}>رمز عبور</Text>
          <TextInput
            style={authStyles.input}
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
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />
        </View>

        {passwordErrors.length > 0 && (
          <View className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <Text className="text-red-400 text-sm font-semibold mb-2" style={{ fontFamily: "Meem-SemiBold" }}>
              رمز عبور باید شامل موارد زیر باشد:
            </Text>
            <View className="space-y-1">
              {passwordErrors.map((error, index) => (
                <View key={index} className="flex-row items-center gap-2 mb-1">
                  <Text className="text-red-400" style={{ fontFamily: "Meem-Regular" }}>•</Text>
                  <Text className="text-red-300 text-sm" style={{ fontFamily: "Meem-Regular" }}>{error}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirm Password Field */}
        <View>
          <Text style={authStyles.label}>تأیید رمز عبور</Text>
          <TextInput
            style={authStyles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="رمز عبور را دوباره وارد کنید"
            placeholderTextColor="#9ca3af"
            editable={!loading}
          />
        </View>

        {/* Referral Code Field */}
        <View>
          <Text style={authStyles.label}>کد معرف (اختیاری)</Text>
          <TextInput
            style={authStyles.input}
            value={referralCode}
            onChangeText={(text) => setReferralCode(text.toUpperCase().trim())}
            placeholder="کد معرف را وارد کنید"
            placeholderTextColor="#9ca3af"
            editable={!loading}
            autoCapitalize="characters"
            maxLength={8}
          />
          <Text style={authStyles.helperText}>اگر کد معرف دارید، آن را وارد کنید</Text>
        </View>

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text style={authStyles.buttonText}>در حال ایجاد حساب...</Text>
            </View>
          ) : (
            <Text style={authStyles.buttonText}>ثبت نام</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// YekDo login design - Figma node 320-605
const authStyles = StyleSheet.create({
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    fontFamily: "Meem-Medium",
  },
  input: {
    backgroundColor: "rgba(30, 58, 110, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Meem-Regular",
  },
  button: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600", fontFamily: "Meem-SemiBold" },
  requirementsBox: {
    backgroundColor: "rgba(30, 58, 110, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  requirementsTitle: {
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Meem-SemiBold",
  },
  requirementsBullet: { color: "#93c5fd", fontFamily: "Meem-Regular" },
  requirementsText: { color: "#bfdbfe", fontSize: 14, fontFamily: "Meem-Regular" },
  helperText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
    fontFamily: "Meem-Regular",
  },
});
