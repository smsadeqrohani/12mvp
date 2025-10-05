import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { ProfileSetup } from "./ProfileSetup";
import { HelloPage } from "./HelloPage";

export function HomePage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);
  const navigate = useNavigate();

  // Always call useEffect at the top level
  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/login", { replace: true });
    }
  }, [loggedInUser, navigate]);

  // Show loading while checking authentication
  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (loggedInUser === null) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // User is authenticated, show appropriate content
  return (
    <div className="flex flex-col gap-6">
      {!userProfile ? <ProfileSetup /> : <HelloPage />}
    </div>
  );
}
