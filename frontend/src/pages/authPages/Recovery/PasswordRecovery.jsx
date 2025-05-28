import Header from '../../components/sections/header/Header';
import DirectoryNavigation from '../../components/sections/nav/directoryNav/DirectoryNavigation';
import './PasswordRecovery.css';
import React, { useState, useEffect } from "react";
import ToastContainer from '../../components/toasts/ToastContainer';
import { toast } from '../../../modules/Store/ToastStore'; 

export default function PasswordRecovery() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [btnText, setBtnText] = useState('Get code');
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);
    const [changeBtnDisabled, setChangeBtnDisabled] = useState(true);
    const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/auth`;

    const handleGetCode = async () => {
    try {
        if (btnText === 'Get code') {
        if (!email) return toast.error('Please enter an email.');

        setBtnDisabled(true);
        setBtnText('Sending code...');

        const res = await fetch(`${API_BASE}/send-recovery-code/${email}`);
        const data = await res.json();

        if (res.ok) {
            toast.success('Recovery code sent to your email.');
            setBtnText('Verify code');
        } else {
            throw new Error(data.message || 'Failed to send code');
        }
        }

        else if (btnText === 'Verify code' && code.length === 6) {
        setBtnDisabled(true);
        setBtnText('Verifying...');

        const res = await fetch(`${API_BASE}/verify-recovery-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success('Code verified. You can now reset your password.');
            setBtnText('Verified');
            setShowNewPasswordFields(true);
        } else {
            throw new Error(data.message || 'Invalid code');
        }
        }

        else if (btnText === 'Verified' && !changeBtnDisabled) {
        const res = await fetch(`${API_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success('Password updated successfully!');
            resetForm();
        } else {
            throw new Error(data.message || 'Failed to reset password');
        }
        }
    } catch (err) {
        toast.error(err.message || 'Something went wrong');
        setBtnDisabled(false);
        setBtnText('Get code');
    }
    };

    useEffect(() => {
        if (btnText === 'Verify code' && code.length === 6) {
            setBtnDisabled(false);
        } else if (btnText === 'Verify code') {
            setBtnDisabled(true);
        }
    }, [code, btnText]);

    useEffect(() => {
        if (showNewPasswordFields && newPassword && confirmPassword && newPassword === confirmPassword) {
            setChangeBtnDisabled(false);
        } else {
            setChangeBtnDisabled(true);
        }
    }, [newPassword, confirmPassword, showNewPasswordFields]);

    const resetForm = () => {
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setBtnText('Get code');
        setBtnDisabled(false);
        setShowNewPasswordFields(false);
        setChangeBtnDisabled(true);
    };

    return (
        <div className='passwordRecoveryContainer'>
            <Header />
            <h1>Password Recovery</h1>
            <p>Make sure you enter the correct email. Enter the code that will be sent to the email.</p>

            <div className="inputContainer">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className="floatingLabel">Email</label>
            </div>

            <div className="inputContainer">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <label className="floatingLabel">Code</label>
            </div>

            <button
                className="gbtn_0"
                onClick={handleGetCode}
                disabled={btnDisabled}
            >
                {btnText}
            </button>

            <br />

            {showNewPasswordFields && (
                <>
                    <div className="inputContainer passwordsCont">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <label className="floatingLabel">New password</label>
                    </div>

                    <div className="inputContainer">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label className="floatingLabel">Confirm password</label>
                    </div>

                    <button
                        className="changePSBtn"
                        onClick={handleGetCode}
                        disabled={changeBtnDisabled}
                    >
                        Change
                    </button>
                </>
            )}
            <ToastContainer />
        </div>
    );
}
