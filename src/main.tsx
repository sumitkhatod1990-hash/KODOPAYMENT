import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Unhandled app error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f8fb] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto text-xl font-bold">
              Q
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              QivroPay Platform
            </h2>
            <p className="text-xs text-slate-500">
              An unexpected issue occurred while rendering the page. Click below to recover and refresh your workspace.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('qivropay_last_view');
                window.location.href = '/';
              }}
              className="w-full py-3 rounded-xl bg-[#0A0D14] text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Reload QivroPay Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
