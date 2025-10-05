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
        <div className="text-center text-sm text-gray-300">
          <span>
            {flow === "signIn"
              ? "حساب ندارید؟ "
              : "قبلاً حساب دارید؟ "}
          </span>
          <button
            type="button"
            className="text-accent hover:text-accent-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "ثبت نام کنید" : "وارد شوید"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-500" />
        <span className="mx-4 text-gray-300">یا</span>
        <hr className="my-4 grow border-gray-500" />
      </div>
      <button 
        className="auth-button" 
        onClick={() => void signIn("anonymous").then(() => navigate("/"))}
      >
        ورود ناشناس
      </button>
    </div>
  );
}
