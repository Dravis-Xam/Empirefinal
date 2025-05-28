import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css';
import Header from './pages/components/sections/header/Header';
import DirectoryNavigation from './pages/components/sections/nav/directoryNav/DirectoryNavigation';

const PrivacyPolicy = () => {
  const [policyText, setPolicyText] = useState('');

  useEffect(() => {
    const fetchPolicyText = async () => {
      try {
        const response = await fetch('/PrivacyPolicy.txt');
        const text = await response.text();
        setPolicyText(text);
      } catch (error) {
        console.error('Error loading privacy policy:', error);
        setPolicyText('Unable to load privacy policy at this time. Please try again later.');
      }
    };

    fetchPolicyText();
  }, []);

  const formatPolicyText = (text) => {
    if (!text) return null;

    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.endsWith(':')) {
        return <h2 key={index} className="policy-heading">{paragraph.replace(':', '')}</h2>;
      }
      
      if (paragraph.split('\n').length === 1 && paragraph.length < 100 && !paragraph.includes('.')) {
        return <h3 key={index} className="policy-subheading">{paragraph}</h3>;
      }

      return (
        <p key={index} className="policy-paragraph">
          {paragraph.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return (
    <>
    <Header /><DirectoryNavigation />
        <div className="privacy-policy-container">
        <div className="privacy-policy-card">
            <h1 className="policy-title">Privacy Policy</h1>
            <div className="policy-last-updated">
            Last Updated: {new Date().toLocaleDateString()}
            </div>
            
            <div className="policy-content">
            {formatPolicyText(policyText)}
            </div>
            
            <div className="policy-contact">
            <h3 className="policy-contact-heading">Contact Information</h3>
            <p>
                If you have any questions about this privacy policy, please contact us at:
            </p>
            <p>
                <strong>Email:</strong> empirehub254@gmail.com<br />
                <strong>Address:</strong> Moi avenue, bazaar plaza, floor M1, Unit 3, Shop A2 KE
            </p>
            </div>
        </div>
        </div>
    </>
  );
};

export default PrivacyPolicy;