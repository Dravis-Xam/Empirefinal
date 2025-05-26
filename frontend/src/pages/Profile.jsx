import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import profileIcon from '../assets/icons/user.png';
import EditProfile from "./components/sections/body/editProfile/EditProfile";
import Settings from "./components/sections/body/settings/Settings";
import Preferences from "./components/sections/body/preferences/Preferences";
import Subscriptions from "./components/sections/body/subscriptions/Subscription";
import History from "./components/sections/body/history/History";
import Rewards from "./components/sections/body/Rewards/Rewards";
import DirectoryNavigation from "./components/sections/nav/directoryNav/DirectoryNavigation";
import { useAuth } from "../modules/Store/AuthContext";
import './Profile.css';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('edit');
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user, logout } = useAuth();

   useEffect(() => {
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [state]);

    const renderActiveSection = () => {
        switch (activeTab) {
            case 'edit': return <EditProfile />;
            case 'settings': return <Settings />;/*
            case 'preferences': return <Preferences />;
            case 'subscriptions': return <Subscriptions />;
            case 'history': return <History />;
            case 'rewards':
            default: return <Rewards />;*/
        }
    };

    const handleLogout = () => {
        logout(); 
        navigate('/login');
    };

    return (
        <div className="profileContainer">
            <DirectoryNavigation />
            <div className="profileHeader">
                <h1>Profile</h1>
                <img src={profileIcon} alt="profile" />
                <p>Hi, <b>{user?.username || 'Guest'}</b></p>
            </div>
            <hr />
            <div className="pb_container">
                <div className="pb000">
                    <span className={`pb_t ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>Edit profile</span><br />
                    <span className={`pb_t ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</span><br />{/**
                    <span className={`pb_t ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>Preferences<small>coming soon</small></span><br />
                    <span className={`pb_t ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>Subscriptions<small>coming soon</small></span><br />
                    <span className={`pb_t ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>Rewards</span><br />
                    <span className={`pb_t ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History<small>coming soon</small></span> */}    
                    <button className="logoutBtn" onClick={handleLogout}>Log Out</button>
                </div>
                <div className="pb001">
                    {renderActiveSection()}
                </div>
            </div>
        </div>
    );
}