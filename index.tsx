
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Auto-recovery mechanism
    const lastRecovery = sessionStorage.getItem('last_error_recovery');
    const now = Date.now();
    
    // If we haven't recovered in the last 10 seconds, try to recover automatically
    if (!lastRecovery || (now - parseInt(lastRecovery)) > 10000) {
      sessionStorage.setItem('last_error_recovery', now.toString());
      localStorage.clear();
      window.location.reload();
    }
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // If we are here, it means auto-recovery failed or we are in a loop.
      // Show a simple, non-intrusive error message.
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center font-sans">
          <div className="max-w-md space-y-6 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-rose-500">System Error</h1>
            <p className="text-slate-300 text-sm">
              The application encountered a persistent error. We have attempted to recover automatically but failed.
            </p>
            <button 
              onClick={this.handleReset}
              className="w-full px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-widest transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
