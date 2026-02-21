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
import { COLORS } from "../../../lib/colors";

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
            placeholderTextColor={COLORS.neutral[400]}
            selectionColor={COLORS.neutral[400]}
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
            placeholderTextColor={COLORS.neutral[400]}
            selectionColor={COLORS.neutral[400]}
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
          <View
            style={{
              backgroundColor: `${COLORS.red[500]}33`,
              borderWidth: 1,
              borderColor: COLORS.red[400],
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ fontFamily: "Meem-SemiBold", color: COLORS.red[400], fontSize: 14, marginBottom: 8 }}>
              رمز عبور باید شامل موارد زیر باشد:
            </Text>
            <View className="space-y-1">
              {passwordErrors.map((error, index) => (
                <View key={index} className="flex-row items-center gap-2 mb-1">
                  <Text style={{ fontFamily: "Meem-Regular", color: COLORS.red[400] }}>•</Text>
                  <Text style={{ fontFamily: "Meem-Regular", color: COLORS.red[300], fontSize: 14 }}>{error}</Text>
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
              <ActivityIndicator size="small" color={COLORS.neutral[100]} />
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

// YekDo design - colors from design system
const styles = StyleSheet.create({
  label: {
    fontFamily: "Meem-Medium",
    color: COLORS.neutral[200],
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    fontFamily: "Meem-Regular",
    backgroundColor: COLORS.blue[900],
    borderWidth: 1,
    borderColor: COLORS.blue[700],
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.neutral[100],
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.blue[500], // blue/blue-500
    borderWidth: 1,
    borderColor: COLORS.blue[300], // blue/blue-300
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Meem-SemiBold",
    color: COLORS.neutral[100],
    fontSize: 16,
  },
});
