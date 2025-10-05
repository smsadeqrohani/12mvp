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
        <h1 className="text-4xl font-bold text-accent mb-4">
          سلام، {userProfile.name}! 👋
        </h1>
        <p className="text-lg text-gray-300">
          به داشبورد خود خوش آمدید
        </p>
      </div>
      
      <div className="bg-background-light rounded-lg p-6 shadow-sm border border-gray-500">
        <h2 className="text-xl font-semibold mb-4 text-white">حساب شما</h2>
        <div className="space-y-2 text-right">
          <p><span className="font-medium text-gray-300">نام:</span> <span className="text-white">{userProfile.name}</span></p>
          <p><span className="font-medium text-gray-300">ایمیل:</span> <span className="text-white">{loggedInUser.email}</span></p>
          <p><span className="font-medium text-gray-300">عضو از:</span> <span className="text-white">{new Date(loggedInUser._creationTime).toLocaleDateString('fa-IR')}</span></p>
        </div>
      </div>

      <div className="bg-accent/20 rounded-lg p-6 border border-accent/30">
        <h3 className="text-lg font-semibold text-accent mb-2">🎉 همه چیز آماده است!</h3>
        <p className="text-gray-300">
          حساب شما با موفقیت ایجاد شد. اکنون می‌توانید از برنامه استفاده کنید.
        </p>
      </div>
    </div>
  );
}
