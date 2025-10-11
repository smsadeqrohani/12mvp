import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { SignInForm, SignUpForm } from "../../src/features/auth";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
      >
        <View className="max-w-md w-full mx-auto">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="bg-accent/20 rounded-full p-6 mb-6">
              <Text className="text-5xl">🏆</Text>
            </View>
            <Text className="text-4xl font-bold text-accent mb-3 text-center">
              به 12 MVP خوش آمدید
            </Text>
            <Text className="text-lg text-gray-300 text-center">
              {isSignUp ? "حساب کاربری خود را ایجاد کنید" : "برای ادامه وارد شوید"}
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-background-light rounded-2xl p-6 border border-gray-700 shadow-lg">
            {isSignUp ? <SignUpForm /> : <SignInForm />}
          </View>
          
          {/* Toggle Form */}
          <View className="items-center mt-6">
            <TouchableOpacity 
              onPress={() => setIsSignUp(!isSignUp)}
              className="py-3 px-6 rounded-lg bg-background-light border border-gray-700"
            >
              <Text className="text-accent font-semibold">
                {isSignUp 
                  ? "قبلاً حساب دارید؟ وارد شوید" 
                  : "حساب ندارید؟ ثبت نام کنید"
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text className="text-gray-400 text-sm text-center">
              با ورود به برنامه، شرایط و قوانین را می‌پذیرید
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

