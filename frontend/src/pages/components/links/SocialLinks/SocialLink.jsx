import React from "react";
import './SocialLink.css';
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { FaWhatsapp, FaTiktok } from "react-icons/fa";

export default function SocialLinks() {
  return (
    <div className="socialLinks">
      <span>
        <a href="https://www.facebook.com/empirehubphones" target="_blank" rel="noopener noreferrer" title="Facebook">
          <FiFacebook size={20} />
        </a>
      </span>
      <span>
        <a href="https://www.tiktok.com/@empirehub3" target="_blank" rel="noopener noreferrer" title="TikTok">
          <FaTiktok size={20} />
        </a>
      </span>
      <span>
        <a href="https://x.com/empirehub_254" target="_blank" rel="noopener noreferrer" title="Twitter">
          <FiTwitter size={20} />
        </a>
      </span>
      <span>
        <a href="https://www.instagram.com/empirehub_phones/" target="_blank" rel="noopener noreferrer" title="Instagram">
          <FiInstagram size={20} />
        </a>
      </span>
      <span>
        <a
          href="https://wa.me/+254711489056"
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
        >
          <FaWhatsapp size={20} />
        </a>
      </span>
    </div>
  );
}
