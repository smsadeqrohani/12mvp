import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function HelloPage() {
  const userProfile = useQuery(api.auth.getUserProfile);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (!userProfile || !loggedInUser) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-4">
          Hello, {userProfile.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your dashboard
        </p>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="space-y-2 text-left">
          <p><span className="font-medium">Name:</span> {userProfile.name}</p>
          <p><span className="font-medium">Email:</span> {loggedInUser.email}</p>
          <p><span className="font-medium">Member since:</span> {new Date(loggedInUser._creationTime).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">🎉 You're all set!</h3>
        <p className="text-blue-700">
          Your account has been created successfully. You can now start using the application.
        </p>
      </div>
    </div>
  );
}
