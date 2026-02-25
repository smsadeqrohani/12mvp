"use client";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "../../../lib/toast";
import { useRouter } from "expo-router";
import { KeyboardAvoidingContainer } from "../../../components/ui";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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

  const handleSubmit = () => {
    setSubmitting(true);
    
    // Validate password only for sign up flow
    if (flow === "signUp") {
      const errors = validatePassword(password);
      if (errors.length > 0) {
        setPasswordErrors(errors);
        toast.error("رمز عبور معیارهای امنیتی را برآورده نمی‌کند");
        setSubmitting(false);
        return;
      }
    }
    
    void signIn("password", { email, password, flow })
      .then(() => {
        toast.success(flow === "signIn" ? "با موفقیت وارد شدید" : "حساب کاربری با موفقیت ایجاد شد");
        router.replace("/");
      })
      .catch((error) => {
        let toastTitle = "";
        if (error.message.includes("Invalid password")) {
          toastTitle = "رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.";
        } else {
          toastTitle =
            flow === "signIn"
              ? "ورود ناموفق، آیا قصد ثبت نام داشتید؟"
              : "ثبت نام ناموفق، آیا قصد ورود داشتید؟";
        }
        toast.error(toastTitle);
        setSubmitting(false);
      });
  };

  return (
    <KeyboardAvoidingContainer className="w-full">
      <View className="flex flex-col gap-4">
        {/* Email Field - YekDo design */}
        <View>
          <Text style={styles.label}>ایمیل</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            placeholder="ایمیل خود را وارد کنید"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!submitting}
          />
        </View>

        {/* Password Field */}
        <View>
          <Text style={styles.label}>رمز عبور</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="رمز عبور را وارد کنید"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (flow === "signUp" && text.length > 0) {
                const errors = validatePassword(text);
                setPasswordErrors(errors);
              } else {
                setPasswordErrors([]);
              }
            }}
            editable={!submitting}
          />
        </View>

        {flow === "signUp" && passwordErrors.length > 0 && (
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

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>در حال پردازش...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {flow === "signIn" ? "ورود" : "ثبت نام"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingContainer>
  );
}

// YekDo login design - Figma node 320-605
const styles = StyleSheet.create({
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Meem-SemiBold",
  },
});
