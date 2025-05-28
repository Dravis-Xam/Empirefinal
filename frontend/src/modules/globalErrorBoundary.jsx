import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ErrorRedirector = ({ error }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/maintenance", { state: { error: error?.toString() }, replace: true });
  }, [error, navigate]);

  return null;
};

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, redirect: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    console.error("Unhandled error:", error, errorInfo);

    try {
      const { user } = this.props;

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/maintenance/errors`, {
        message: error.message,
        stack: error.stack,
        location: {
          pathname: window.location.pathname,
          component: this.props.componentName || null
        },
        user: {
          username: user?.username || 'guest',
          role: user?.role || 'unknown',
          userId: user?._id || null
        },
        level: 'error',
        metadata: {
          info: errorInfo?.componentStack
        }
      });
    } catch (err) {
      console.error("Failed to log error to backend:", err);
    }

    this.setState({ redirect: true });
  }

  render() {
    if (this.state.redirect) {
      return (
        <ErrorRedirector error={{ error: this.state.error?.toString() }}/>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;