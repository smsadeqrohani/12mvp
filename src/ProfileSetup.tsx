import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileSetup() {
  const createProfile = useMutation(api.auth.createProfile);
  const [loading, setLoading] = useState(false);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary mb-4">Complete Your Profile</h2>
      <p className="text-gray-600 mb-6">What should we call you?</p>
      
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          const formData = new FormData(event.currentTarget);
          const name = formData.get("name") as string;

          createProfile({ name })
            .then(() => {
              toast.success("Profile created!");
            })
            .catch((error) => {
              console.error(error);
              toast.error("Could not create profile");
            })
            .finally(() => setLoading(false));
        }}
      >
        <label htmlFor="name">Your Name</label>
        <input
          name="name"
          id="name"
          type="text"
          className="auth-input-field"
          placeholder="Enter your name"
          required
          disabled={loading}
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Creating profile..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
