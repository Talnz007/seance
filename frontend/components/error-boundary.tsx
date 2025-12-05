'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 bg-slate-950"
          role="alert"
          aria-live="assertive"
        >
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <h2 
                className="text-2xl font-bold text-slate-100 mb-2"
                id="error-title"
              >
                Something went wrong
              </h2>
              <p 
                className="text-slate-400 mb-4"
                id="error-description"
              >
                The spirits have encountered an error. Please try again.
              </p>
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-red-400 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <Button 
              onClick={this.handleReset} 
              className="w-full"
              aria-describedby="error-title error-description"
            >
              Try Again
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
