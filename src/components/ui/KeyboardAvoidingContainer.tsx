import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

interface KeyboardAvoidingContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * If true, wraps content in ScrollView for scrollable forms
   * @default true
   */
  scrollable?: boolean;
}

/**
 * Cross-platform keyboard avoiding container
 * Automatically adjusts content when keyboard appears
 * 
 * Usage:
 * ```tsx
 * <KeyboardAvoidingContainer>
 *   <TextInput ... />
 *   <TextInput ... />
 *   <Button ... />
 * </KeyboardAvoidingContainer>
 * ```
 */
export function KeyboardAvoidingContainer({
  children,
  className = "",
  scrollable = true,
}: KeyboardAvoidingContainerProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Container
        className={scrollable ? "flex-1" : className}
        {...(scrollable
          ? {
              contentContainerClassName: className,
              showsVerticalScrollIndicator: false,
              keyboardShouldPersistTaps: "handled",
            }
          : {})}
      >
        {children}
      </Container>
    </KeyboardAvoidingView>
  );
}

