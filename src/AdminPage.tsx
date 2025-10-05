import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../convex/_generated/api";

export function AdminPage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);
  const navigate = useNavigate();

  // Always call useEffect at the top level
  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/login", { replace: true });
    } else if (userProfile && !userProfile.isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loggedInUser, userProfile, navigate]);

  // Show loading while checking authentication and admin status
  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (loggedInUser === null || (userProfile && !userProfile.isAdmin)) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-accent mb-4">
          پنل مدیریت
        </h1>
        <p className="text-lg text-gray-300">
          خوش آمدید، {userProfile.name}
        </p>
      </div>
      
      <div className="bg-background-light rounded-lg p-6 shadow-sm border border-gray-500">
        <h2 className="text-xl font-semibold mb-4 text-white">وضعیت سیستم</h2>
        <div className="space-y-2 text-right">
          <p><span className="font-medium text-gray-300">نوع کاربر:</span> <span className="text-accent">مدیر</span></p>
          <p><span className="font-medium text-gray-300">وضعیت:</span> <span className="text-green-400">فعال</span></p>
        </div>
      </div>

      <div className="bg-accent/20 rounded-lg p-6 border border-accent/30">
        <h3 className="text-lg font-semibold text-accent mb-2">🚀 آماده برای توسعه</h3>
        <p className="text-gray-300">
          پنل مدیریت آماده است. به زودی قابلیت‌های مدیریتی اضافه خواهد شد.
        </p>
      </div>
    </div>
  );
}
