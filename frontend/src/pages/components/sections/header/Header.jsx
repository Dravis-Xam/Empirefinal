import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../../modules/Store/AuthContext"; 
import './styles.css'

export default function Header() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('');
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

    const deliveryS = localStorage.getItem('delivery')

    const handleNavigate = (path) => {
        setActiveTab(currentPath);
        navigate(path);
    };

    return (
        <header>
            <h1>Empire Hub Phones</h1>
            <div className="leftTop">
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
                        >Delivery</span>}
                        <button className="logoutBtn" onClick={logout}>
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