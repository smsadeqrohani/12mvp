import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
          toast.error("رمزهای عبور مطابقت ندارند");
          setLoading(false);
          return;
        }

        signIn("password", { email, password, flow: "signUp" })
          .then(() => {
            navigate("/");
          })
          .catch((error) => {
            console.error(error);
            toast.error("نمی‌توان حساب ایجاد کرد");
          })
          .finally(() => setLoading(false));
      }}
    >
      <label htmlFor="email" className="text-gray-300">ایمیل</label>
      <input
        name="email"
        id="email"
        type="email"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <label htmlFor="password" className="text-gray-300">رمز عبور</label>
      <input
        name="password"
        id="password"
        type="password"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <label htmlFor="confirmPassword" className="text-gray-300">تأیید رمز عبور</label>
      <input
        name="confirmPassword"
        id="confirmPassword"
        type="password"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? "در حال ایجاد حساب..." : "ثبت نام"}
      </button>
    </form>
  );
}
