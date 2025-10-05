import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);

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
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }

        signIn("password", { email, password, flow: "signUp" })
          .catch((error) => {
            console.error(error);
            toast.error("Could not create account");
          })
          .finally(() => setLoading(false));
      }}
    >
      <label htmlFor="email">Email</label>
      <input
        name="email"
        id="email"
        type="email"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <label htmlFor="password">Password</label>
      <input
        name="password"
        id="password"
        type="password"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        name="confirmPassword"
        id="confirmPassword"
        type="password"
        className="auth-input-field"
        required
        disabled={loading}
      />
      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
