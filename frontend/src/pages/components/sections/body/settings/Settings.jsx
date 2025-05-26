import React from "react";
import './settings.css';
import ToggleButton from "../../../buttons/toggleBtn/ToggleButton";
import { useTheme } from "../../../../../modules/Store/ThemeContext";

export default function Settings() {
    
  const { theme, toggleTheme } = useTheme();

    return <div className="settingsContainer">
        <h1>Settings</h1>
        <h3>Themes</h3>
        <p>
            <small className="pt000">Choose your preferred theme</small>
            <ToggleButton
                isOnDefault={false}
                onToggle={()=>toggleTheme()}
                labels={['Light', 'Dark']}
                colors={['#eee' , '#333']}
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
    </div>
}