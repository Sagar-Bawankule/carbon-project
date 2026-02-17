import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error);
        console.error('Error info:', errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
                            <p className="text-slate-600 mb-4">
                                We encountered an error while loading this page.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="text-left bg-slate-50 rounded-lg p-4 mb-4 max-h-40 overflow-auto">
                                    <p className="text-xs font-mono text-red-600 mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    <pre className="text-xs text-slate-500 whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary w-full"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
