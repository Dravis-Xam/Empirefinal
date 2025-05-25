import React from "react";
import './SocialLink.css';
import { facebookForDark, facebookForLight, instagramForDark, instagramForLight, twitterForDark, twitterForLight, telegramForDark, telegramForLight } from '../../../../assets/icons/GetIcons.js';

export default function SocialLinks() {
    return <div className="socialLinks">
        <span><a href=""><img src={facebookForDark} alt="..." /></a></span>
        <span><a href=""><img src={twitterForDark} alt="..." /></a></span>
        <span><a href=""><img src={instagramForDark} alt="..." /></a></span>
        <span><a href=""><img src={telegramForDark} alt="..." /></a></span>
    </div>
}