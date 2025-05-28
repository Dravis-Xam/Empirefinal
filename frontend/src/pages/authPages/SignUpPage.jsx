import React, { useState, useEffect } from "react";
import './SignUpPage.css';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../modules/Store/AuthContext';
import { toast } from "../../modules/Store/ToastStore";
import ToastContainer from "../components/toasts/ToastContainer";

export default function SignUpPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [hidden, setHidden] = useState(true);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                toast.error(errorData.message || 'Signup failed');
                return;
            }

            const data = await response.json();

            localStorage.setItem('username', formData.username);
            localStorage.setItem('email', formData.email);

            login(formData.username); 

            toast.success('Signup successful!');
            navigate('/login');
        } catch (error) {
            console.error('Signup error:', error);
            toast.error('An error occurred during signup. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`signup-page-container ${mounted ? 'mounted' : ''}`}>
            <div className="signup-form-wrapper">
                <h1 className="signup-title">Create Account</h1>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className={`signup-input-container ${formData.username ? 'filled' : ''}`}>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />
                        <label className="signup-floating-label">Username</label>
                        <span className="signup-input-highlight"></span>
                    </div>

                    <div className={`signup-input-container ${formData.email ? 'filled' : ''}`}>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />
                        <label className="signup-floating-label">Email</label>
                        <span className="signup-input-highlight"></span>
                    </div>

                    <div className={`signup-input-container ${formData.password ? 'filled' : ''}`}>
                        <input
                            type={hidden ? 'password' : 'text'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />
                        <label className="signup-floating-label">Password</label>
                        <span className="signup-input-highlight"></span>
                        <button
                            type="button"
                            onClick={handleShowPassword}
                            className="signup-toggle-password"
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
                        className="signup-submit-btn" 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="signup-spinner"></span>
                        ) : 'Sign Up'}
                    </button>
                </form>

                <div className="signup-links">
                    <span>Already have an account?</span>
                    <Link to='/login' className="signup-link">
                        Login
                    </Link>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}