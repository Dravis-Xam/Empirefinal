import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../modules/Store/AuthContext"; 
import './styles.css'

export default function Header() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    
    const location = useLocation();

    const paths = {
        "/": "home",
        "/cart": "cart",
        '/profile': 'profile',
        '/login': 'login',
        '/signup': 'signup',
        '/track-delivery': 'track delivery'
    }

    const currentPath = paths[location.pathname];

    const deliveryS = localStorage.getItem('delivery');

    const handleNavigate = (path) => {
        setActiveTab(currentPath);
        navigate(path);
        setIsMobileMenuOpen(false); // Close menu after navigation
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobileMenuOpen && !e.target.closest('.leftTop') && !e.target.closest('.hamburger')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    return (
        <header>
            <h1>Empire Hub Phones</h1>
            
            {/* Hamburger Menu Button */}
            <button 
                className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            
            {/* Navigation Links */}
            <div className={`leftTop ${isMobileMenuOpen ? 'open' : ''}`}>
                <span
                    className={activeTab === 'home' ? 'active' : ''}
                    onClick={() => handleNavigate('/')}
                >
                    Home
                </span>
                <span
                    className={activeTab === 'cart' ? 'active' : ''}
                    onClick={() => handleNavigate('/cart')}
                >
                    Cart
                </span>

                {user ? (
                    <>
                        <span
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => handleNavigate('/profile')}
                        >
                            Profile
                        </span>
                        {deliveryS === 'ongoing' && <span
                            className={activeTab === 'delivery' ? 'active' : ''}
                            onClick={()=> handleNavigate('/track-delivery')}
                        >
                            Delivery
                        </span>}
                        <button className="logoutBtn" onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className={`loginBtn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => handleNavigate('/login')}
                        >
                            Login
                        </button>
                        <button
                            className={`signupBtn ${activeTab === 'signup' ? 'active' : ''}`}
                            onClick={() => handleNavigate('/signup')}
                        >
                            Sign up
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}