import { Component, ReactNode, ErrorInfo } from "react";

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
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="bg-background-light rounded-2xl border border-gray-700 p-8 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-accent mb-3">خطای غیرمنتظره</h2>
            <p className="text-gray-300 mb-6">
              متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.
            </p>
            {this.state.error && (
              <details className="mb-6 text-right">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  جزئیات خطا
                </summary>
                <pre className="mt-3 p-4 bg-background rounded-lg text-xs text-red-400 overflow-auto text-left">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

