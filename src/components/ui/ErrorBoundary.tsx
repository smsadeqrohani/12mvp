import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * With custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * With error callback:
 * <ErrorBoundary onError={(error, errorInfo) => logError(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null 
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 bg-background items-center justify-center p-6">
          <View className="bg-red-900/20 border border-red-800/30 rounded-2xl p-8 max-w-md w-full">
            {/* Error Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-900/30 rounded-full items-center justify-center">
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
            </View>

            {/* Error Title */}
            <Text className="text-white text-2xl font-bold text-center mb-3">
              خطایی رخ داده است
            </Text>

            {/* Error Message */}
            <Text className="text-gray-400 text-center mb-2">
              متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
            </Text>

            {/* Error Details (only in development) */}
            {__DEV__ && this.state.error && (
              <View className="bg-gray-900/50 rounded-lg p-3 mt-3 mb-3">
                <Text className="text-red-400 text-xs font-mono">
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {/* Retry Button */}
            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-accent active:bg-accent-hover rounded-lg px-6 py-3 mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold text-center text-base">
                تلاش مجدد
              </Text>
            </TouchableOpacity>

            {/* Help Text */}
            <Text className="text-gray-500 text-xs text-center mt-4">
              در صورت تکرار خطا، لطفاً برنامه را ببندید و دوباره باز کنید
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
