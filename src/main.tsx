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
  showDetails: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, showDetails: false };
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
        <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0055FF] flex items-center justify-center mx-auto text-2xl font-bold font-heading">
              Q
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                QivroPay Platform
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Click below to reset state and load your high-speed merchant workspace.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-mono underline"
                >
                  {this.state.showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-40">
                    {this.state.error.toString()}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('qivropay_last_view');
                    localStorage.removeItem('qivropay_setup_guide_completed');
                  } catch (e) {}
                  window.location.href = '/';
                }}
                className="w-full py-3.5 rounded-xl bg-[#0A0D14] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-98"
              >
                Reset &amp; Reload Workspace
              </button>

              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
              >
                Attempt Instant Retry
              </button>
            </div>
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
