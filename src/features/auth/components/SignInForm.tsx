"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const navigate = useNavigate();

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

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          const password = formData.get("password") as string;
          
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
          
          formData.set("flow", flow);
          void signIn("password", formData)
            .then(() => {
              toast.success(flow === "signIn" ? "با موفقیت وارد شدید" : "حساب کاربری با موفقیت ایجاد شد");
              navigate("/");
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
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="ایمیل"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="رمز عبور"
          required
          onChange={(e) => {
            if (flow === "signUp" && e.target.value.length > 0) {
              const errors = validatePassword(e.target.value);
              setPasswordErrors(errors);
            } else {
              setPasswordErrors([]);
            }
          }}
        />
        {flow === "signUp" && passwordErrors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-2">
            <p className="text-red-400 text-sm font-semibold mb-2">رمز عبور باید شامل موارد زیر باشد:</p>
            <ul className="text-red-300 text-sm space-y-1">
              {passwordErrors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>در حال پردازش...</span>
            </div>
          ) : (
            flow === "signIn" ? "ورود" : "ثبت نام"
          )}
        </button>
      </form>
    </div>
  );
}
