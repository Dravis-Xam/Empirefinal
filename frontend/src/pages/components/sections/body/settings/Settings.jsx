import React from "react";
import './settings.css';
import ToggleButton from "../../../buttons/toggleBtn/ToggleButton";

export default function Settings() {
    return <div className="settingsContainer">
        <h1>Settings</h1>
        <h3>Themes</h3>
        <p>
            <small className="pt000">Choose your preferred theme</small>
            <ToggleButton
            isOnDefault={false}
            onToggle={(state) => console.log('Dark mode:', state)}
            labels={['Light', 'Dark']}
            colors={['#eee', '#333']}
            icons={['🌞', '🌙']}
        />
        </p>
        <h3>Notifications</h3>
        <p>
            <small className="pt000">Turn on and off Notifications</small>
            <ToggleButton
                isOnDefault={true}
                onToggle={(state) => console.log('Notifications:', state)}
                labels={['Off', 'On']}
                colors={['#888', '#0f0']}
                icons={['🔕', '🔔']}
        />
        </p>
        <h3>Personalisation</h3><small>coming soon ...</small>
    </div>
}