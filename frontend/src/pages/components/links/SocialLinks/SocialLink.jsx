import React from "react";
import './SocialLink.css';
import { facebookForDark, instagramForDark, twitterForDark, whatsappicon } from '../../../../assets/icons/GetIcons.js';

export default function SocialLinks() {
    return <div className="socialLinks">
        <span><a href="https://www.facebook.com/empirehubphones" target="_blank"><img src={facebookForDark} alt="..." /></a></span>
        <span><a href="https://www.tiktok.com/@empirehub3" target="_blank"><img src={twitterForDark} alt="..." /></a></span>
        <span><a href="https://www.instagram.com/empirehub_phones/" target="_blank"><img src={instagramForDark} alt="..." /></a></span>
        <span><a href="https://l.instagram.com/?u=https%3A%2F%2Fwa.me%2F%2B254711489056%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAac0QZ1A_JjTEQD5tWiPZdK54K7G2x2-1aixynKpz9qohUU43dE7IeZ8xfWnsQ_aem_O0JAm4UTPmmAPQ-5u2kXUQ&e=AT2giPvuz_1H89YtKogtJbMKCjnkvGvnxXqImAsHlAVvvUfghrrJ39vItqnHexPjMxu6wfuJAmJuovDZpn2RyZ1Tic0PUDBaQ3FYxPs" target="_blank"><img src={whatsappicon} alt="..." /></a></span>
    </div>
}