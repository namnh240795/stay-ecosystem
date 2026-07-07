import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">!</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Đã xảy ra lỗi</h3>
            <p className="text-sm text-slate-500">
              {this.state.error?.message || 'Không thể tải nội dung trang này.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
