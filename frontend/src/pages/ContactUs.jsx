import React, { useState } from 'react';
import Header from './components/sections/header/Header';
import DirectoryNavigation from './components/sections/nav/directoryNav/DirectoryNavigation';
import './ContactUs.css';
import { toast } from '../modules/Store/ToastStore';
import MoveToTop from './components/buttons/movetotop/MoveToTop';

export default function ContactUs() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
  if (!username.trim() || !message.trim()) {
    toast.error('Please fill out all fields.');
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Email failed');

    toast.success('Message sent successfully!');
    setUsername('');
    setMessage('');
  } catch (err) {
    console.error(err);
    toast.error(err.message || 'Something went wrong.');
  }
};

  return (
    <div className="contactPage">
      <Header />
      <DirectoryNavigation />
      <h1>Contact Us</h1>

      <section className='contact-form'>
        <h3>Send us a message</h3>
        <div className="inputContainer">
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="floatingLabel">Username</label>
        </div>
        <div className="inputContainer">
          <textarea
            name="message"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <label className="floatingLabel">Message</label>
        </div>
        <button className="gbtn_0" onClick={handleSubmit}>Send</button>
      </section>

      <section>
        <h3>FAQs</h3>
        {/* You can use accordion or simple toggle UI */}
        <details>
          <summary>How long does shipping take?</summary>
          <p>Typically 2–5 business days depending on your location.</p>
        </details>
        <details>
          <summary>Can I return a phone?</summary>
          <p>Yes, within 7 days of delivery if it's in original condition.</p>
        </details>
      </section>

      <section>
        <h3>Any Questions</h3>
        <p>Reach us through: </p>
        <ul>
          <li><strong>Location: </strong> Moi avenue, bazaar plaza, floor M1, Unit 3, Shop A2</li>
          <li><strong>Email: </strong> empirehub254@gmail.com</li>
          <li><strong>Contact number: </strong> 0700 029 555 or 0700 023 555</li>
        </ul>
      </section>

      <section>
        <h3>Visit Us</h3>
        <iframe
          title="Empire Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819658856513!2d36.81902107404565!3d-1.281974185619477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d45af411ad%3A0x6123ae4b4551b201!2sBazaar%20Plaza%2C%20Moi%20Ave%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1747285976681!5m2!1sen!2ske"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
      <MoveToTop />
    </div>
  );
}