"use client";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
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
        {/* Email Field */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">ایمیل</Text>
          <TextInput
            className="auth-input-field"
            keyboardType="email-address"
            placeholder="example@email.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!submitting}
          />
        </View>

        {/* Password Field */}
        <View>
          <Text className="text-gray-300 mb-2 font-medium">رمز عبور</Text>
          <TextInput
            className="auth-input-field"
            secureTextEntry
            placeholder="رمز عبور خود را وارد کنید"
            placeholderTextColor="#6b7280"
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

        <TouchableOpacity 
          className="auth-button mt-2" 
          onPress={handleSubmit} 
          disabled={submitting}
        >
          {submitting ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold text-base">در حال پردازش...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-base">
              {flow === "signIn" ? "ورود" : "ثبت نام"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingContainer>
  );
}
