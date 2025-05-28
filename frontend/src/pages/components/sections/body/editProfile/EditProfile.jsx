import React, { useState, useEffect } from "react";
import './EditProfile.css';
import { useAuth } from "../../../../../modules/Store/AuthContext";
import { toast } from "../../../../../modules/Store/ToastStore";
import ToastContainer from "../../../toasts/ToastContainer";

export default function EditProfile() {
    const { user, updateUser } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Failed to update profile');
                return;
            }

            updateUser({ username, email });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Server error');
        }
    };

    return (
        <section className="editprofilesection">
            <h1>Edit your profile</h1>
            <div className="editProfileInput">
                <input
                    type="text"
                    name="username"
                    value={username}
                    disabled
                />
                <input
                    type="email"
                    name="email"
                    value={email}
                    disabled={!isEditing}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    disabled={!isEditing}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="editProfileBtns">
                    <button className="EditProfileBtn" onClick={handleEditClick} disabled={isEditing}>Edit</button>
                    <button className="SaveProfileBtn" onClick={handleSaveClick} disabled={!isEditing}>Save</button>
                </div>
            </div>
            <ToastContainer />
        </section>
    );
}