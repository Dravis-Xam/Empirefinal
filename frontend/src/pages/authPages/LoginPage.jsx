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

    const role = await login(formData);
    if (!role) return;

    switch (role.toLowerCase()) {
      case "developer":
        navigate("/maintenance");
        break;
      case "inventory manager":
        navigate("/inventory");
        break;
      case "customer care":
        navigate("/customer-care");
        break;
      case "client":
      default:
        navigate("/");
        break;
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