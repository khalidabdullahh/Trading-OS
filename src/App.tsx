import React, { Component, ErrorInfo, ReactNode } from "react";
import { Example } from "@/components/ui/dashboard-with-collapsible-sidebar";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Trading-OS ErrorBoundary caught error]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#090e1a] border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="text-3xl">⚠️</div>
            <h1 className="text-lg font-black text-cyan-400">Trading-OS Terminal Initialization</h1>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "An unexpected error occurred while initializing the workstation."}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Reset Session & Reload Workstation
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Example />
    </ErrorBoundary>
  );
}
