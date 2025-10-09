import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ProfileSetup() {
  const createProfile = useMutation(api.auth.createProfile);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-accent mb-4">پروفایل خود را تکمیل کنید</h2>
      <p className="text-gray-300 mb-6">چطور شما را صدا کنیم؟</p>
      
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          const formData = new FormData(event.currentTarget);
          const name = formData.get("name") as string;

          createProfile({ name })
            .then(() => {
              toast.success("پروفایل ایجاد شد!");
              navigate("/");
            })
            .catch((error) => {
              console.error(error);
              toast.error("نمی‌توان پروفایل ایجاد کرد");
            })
            .finally(() => setLoading(false));
        }}
      >
        <label htmlFor="name" className="text-gray-200">نام شما</label>
        <input
          name="name"
          id="name"
          type="text"
          className="auth-input-field"
          placeholder="نام خود را وارد کنید"
          required
          disabled={loading}
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "در حال ایجاد پروفایل..." : "ادامه"}
        </button>
      </form>
    </div>
  );
}
