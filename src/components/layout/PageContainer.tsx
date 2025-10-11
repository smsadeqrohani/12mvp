import { ReactNode } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  className?: string;
  scrollable?: boolean;
  style?: ViewStyle;
}

/**
 * PageContainer - Consistent page layout wrapper
 * Provides standard padding and max-width for pages
 */
export function PageContainer({ 
  children, 
  maxWidth = "none",
  className = "",
  scrollable = true,
  style,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
    none: "max-w-none",
  };

  const content = (
    <View className={`w-full ${maxWidthClasses[maxWidth]} px-6 py-8 ${className}`} style={style}>
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {content}
    </SafeAreaView>
  );
}

