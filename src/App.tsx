import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { SignUpForm } from "./SignUpForm";
import { ProfileSetup } from "./ProfileSetup";
import { HelloPage } from "./HelloPage";
import { Toaster } from "sonner";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Chef</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const [isSignUp, setIsSignUp] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Unauthenticated>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Chef</h1>
          <p className="text-lg text-gray-600">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {isSignUp ? <SignUpForm /> : <SignInForm />}
        
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!userProfile ? <ProfileSetup /> : <HelloPage />}
      </Authenticated>
    </div>
  );
}
