import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
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
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

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
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-2">
        <p className="text-blue-400 text-sm font-semibold mb-2">معیارهای رمز عبور:</p>
        <ul className="text-blue-300 text-sm space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-blue-400">•</span>
            حداقل ۸ کاراکتر
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">•</span>
            یک حرف بزرگ انگلیسی
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">•</span>
            یک حرف کوچک انگلیسی
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">•</span>
            یک عدد
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">•</span>
            یک کاراکتر ویژه (!@#$%^&*...)
          </li>
        </ul>
      </div>
      <input
        name="password"
        id="password"
        type="password"
        className="auth-input-field"
        required
        disabled={loading}
        onChange={(e) => {
          if (e.target.value.length > 0) {
            const errors = validatePassword(e.target.value);
            setPasswordErrors(errors);
          } else {
            setPasswordErrors([]);
          }
        }}
      />
      {passwordErrors.length > 0 && (
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
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>در حال ایجاد حساب...</span>
          </div>
        ) : (
          "ثبت نام"
        )}
      </button>
    </form>
  );
}
