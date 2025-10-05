"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
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
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "ورود" : "ثبت نام"}
        </button>
      </form>
    </div>
  );
}
