import { useState } from "react";
import { SignInForm, SignUpForm } from "../features/auth";

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-accent mb-4">به 12 MVP خوش آمدید</h1>
        <p className="text-lg text-gray-300">
          {isSignUp ? "حساب کاربری خود را ایجاد کنید" : "برای ادامه وارد شوید"}
        </p>
      </div>

      {isSignUp ? <SignUpForm /> : <SignInForm />}
      
      <div className="text-center mt-4">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-accent hover:underline"
        >
          {isSignUp 
            ? "قبلاً حساب دارید؟ وارد شوید" 
            : "حساب ندارید؟ ثبت نام کنید"
          }
        </button>
      </div>
    </div>
  );
}
