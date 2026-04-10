import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] px-4" dir="rtl">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              نأسف، حدث خطأ ما. يرجى المحاولة مرة أخرى.
            </p>
            {(import.meta as any).env?.MODE === 'development' && this.state.error && (
              <pre className="text-xs text-left text-red-500 dark:text-red-400 bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4 overflow-auto">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
