import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css';
import Header from './pages/components/sections/header/Header';
import DirectoryNavigation from './pages/components/sections/nav/directoryNav/DirectoryNavigation';

const PrivacyPolicy = () => {
  const [policyText, setPolicyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Privacy Policy - Empire Hub Phones Kenya";

    const fetchPolicyText = async () => {
      try {
        const response = await fetch('/PrivacyPolicy.txt');
        const text = await response.text();
        setPolicyText(text);
      } catch (error) {
        console.error('Error loading privacy policy:', error);
        setPolicyText('Unable to load privacy policy at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyText();
  }, []);

  const formatPolicyText = (text) => {
    if (!text) return null;

    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();

      if (trimmed.endsWith(':')) {
        return <h2 key={index} className="policy-heading">{trimmed.replace(':', '')}</h2>;
      }

      if (trimmed.match(/^[\w\s]+$/) && trimmed.length < 80) {
        return <h3 key={index} className="policy-subheading">{trimmed}</h3>;
      }

      return (
        <p key={index} className="policy-paragraph">
          {trimmed.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}<br />
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <>
      <Header />
      <DirectoryNavigation />
      <main className="privacy-policy-container">
        <article className="privacy-policy-card">
          <h1 className="policy-title">Privacy Policy</h1>
          <div className="policy-last-updated">
            Last Updated: {new Date().toLocaleDateString()}
          </div>

          <div className="policy-content">
            {loading ? (
              <div className="policy-loading">
                <div className="loading-spinner"></div>
                <p>Loading privacy policy...</p>
            </div>
            ) : (
              formatPolicyText(policyText)
            )}
          </div>

          <section className="policy-contact">
            <h3 className="policy-contact-heading">Contact Information</h3>
            <p>If you have any questions about this privacy policy, please contact us at:</p>
            <address>
              <strong>Email:</strong> empirehub254@gmail.com<br />
              <strong>Address:</strong> Moi Avenue, Bazaar Plaza, Floor M1, Unit 3, Shop A2, KE
            </address>
          </section>
        </article>
      </main>
    </>
  );
};

export default PrivacyPolicy;
