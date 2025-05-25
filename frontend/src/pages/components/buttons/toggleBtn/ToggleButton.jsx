import React, { useState } from 'react';
import './ToggleButton.css';

export default function ToggleButton({
    isOnDefault = false,
    onToggle = () => {},
    labels = ['Off', 'On'],
    colors = ['#ccc', '#4caf50'],
    icons = [null, null],
}) {
    const [isOn, setIsOn] = useState(isOnDefault);

    const toggle = () => {
        const newState = !isOn;
        setIsOn(newState);
        onToggle(newState);
    };

    return (
        <button
            className="toggle-button"
            style={{ backgroundColor: isOn ? colors[1] : colors[0] }}
            onClick={toggle}
        >
            <div className={`toggle-circle ${isOn ? 'move-right' : ''}`}>
                {isOn ? icons[1] : icons[0]}
            </div>
            <span className={`toggle-label ${isOn ? 'move-left' : ''}`}>{isOn ? labels[1] : labels[0]}</span>
        </button>
    );
}
