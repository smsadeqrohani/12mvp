import React, { Component, ReactNode, ErrorInfo } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <View className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md">
            <Text className="text-2xl font-bold text-red-400 mb-4 text-center">
              خطایی رخ داد
            </Text>
            <Text className="text-gray-300 mb-6 text-center">
              متأسفانه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
            </Text>
            {this.state.error && (
              <Text className="text-red-300 text-sm mb-6 text-center">
                {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-accent px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                تلاش مجدد
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
