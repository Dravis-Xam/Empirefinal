import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../modules/Store/AuthContext"; 
import './styles.css'
import { FaTruck } from 'react-icons/fa';
import { AiOutlineHome, AiOutlineShoppingCart, AiOutlineUser, AiOutlineSetting } from 'react-icons/ai';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { FaSearch } from 'react-icons/fa'

export default function Header() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    
    const location = useLocation();

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

            {currentPath === paths['/'] &&<span className="search-link" onClick={()=>navigate('/search')}>
                <FaSearch />{ width >= 770 ? 'Find the phone of your choice' : 'Search'}
            </span>}
            
            {/* Navigation Links */}
            <div className={`leftTop ${isMobileMenuOpen ? 'open' : ''}`}>
                <span
                    title="home"
                    className={activeTab === 'home' ? 'active' : ''}
                    onClick={() => handleNavigate('/')}
                >
                    { width >= 770 ? <AiOutlineHome /> : 'Home'}
                </span>
                <span
                    title="cart"
                    className={activeTab === 'cart' ? 'active' : ''}
                    onClick={() => handleNavigate('/cart')}
                >
                    { width >= 770 ?  <AiOutlineShoppingCart /> : 'Cart'}
                </span>

                {user ? (
                    <>
                        <span
                            title="profile"
                            className={activeTab === 'profile' ? 'active' : ''}
                            onClick={() => handleNavigate('/profile')}
                        >
                           { width >= 770 ? <AiOutlineUser /> : 'Profile'}
                        </span>
                        <span
                            title="settings"
                            className={activeTab === 'settings' ? 'active' : ''}
                            onClick={() => navigate('/profile', {state: {activeTab: 'settings'}})}
                        >
                            { width >= 770 ? <AiOutlineSetting /> : 'Settings'}
                        </span>
                        {deliveryS === 'ongoing' && <span
                            title="delivery"
                            className={activeTab === 'delivery' ? 'active' : ''}
                            onClick={()=> handleNavigate('/track-delivery')}
                        >
                            { width >= 770 ? <FaTruck /> : 'Delivery'}
                        </span>}
                        <button title='logout' className="logoutBtn" onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                        }}>
                            <RiLogoutBoxLine /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            title="login"
                            className={`loginBtn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => handleNavigate('/login')}
                        >
                            Login
                        </button>
                        <button
                            title="sign up"
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