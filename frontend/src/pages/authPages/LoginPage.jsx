import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../modules/Store/AuthContext';
import './LoginPage.css';
import ToastContainer from "../components/toasts/ToastContainer";
import { toast } from "../../modules/Store/ToastStore";

export default function LoginPage() {
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleShowPassword = (e) => {
    e.preventDefault();
    setHidden(prev => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (!data.role) {
        toast.error('Incomplete login response from server');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('role', data.role);
      localStorage.setItem('username', formData.username);

      await login();

      toast.success('Login successful');

      const role = data.role.toLowerCase();

      switch (role) {
        case 'developer':
          navigate('/maintenance');
          break;
        case 'inventory manager':
          navigate('/inventory');
          break;
        case 'customer care':
          navigate('/customer-care');
          break;
        case 'client':
        default:
          navigate('/');
          break;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page-container ${mounted ? 'mounted' : ''}`}>
      <div className="login-form-wrapper">
        <h1 className="login-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className={`login-input-container ${formData.username ? 'filled' : ''}`}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="login-input"
              required
            />
            <label className="login-floating-label">Username</label>
            <span className="login-input-highlight"></span>
          </div>

          <div className={`login-input-container ${formData.password ? 'filled' : ''}`}>
            <input
              type={hidden ? 'password' : 'text'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
            />
            <label className="login-floating-label">Password</label>
            <span className="login-input-highlight"></span>
            <button
              type="button"
              onClick={handleShowPassword}
              className="login-toggle-password"
            >
              {hidden ? (
                <i className="icon-eye"></i>
              ) : (
                <i className="icon-eye-slash"></i>
              )}
            </button>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner"></span>
            ) : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <Link to='/passwordRecovery' className="login-link">
            Forgot Password?
          </Link>
          <span className="login-link-separator">|</span>
          <Link to='/signup' className="login-link">
            Create Account
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}