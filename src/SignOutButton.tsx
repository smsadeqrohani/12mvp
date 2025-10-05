"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="pl-4 pr-4 py-2 rounded bg-background-light text-accent border border-gray-500 font-semibold hover:bg-accent hover:text-white transition-colors shadow-sm hover:shadow"
      onClick={() => void signOut()}
    >
      خروج
    </button>
  );
}
