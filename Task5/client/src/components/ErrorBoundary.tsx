import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'monospace', background: '#1a1a2e', color: '#e94560', minHeight: '100vh' }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: '#eee', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error?.stack}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: 10, padding: '8px 16px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
