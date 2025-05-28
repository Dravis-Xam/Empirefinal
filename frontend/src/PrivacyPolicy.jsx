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

    fetchPolicyText(policyText);
  }, []);

const formatPolicyText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const paragraphs = [];
  let currentParagraph = '';

  lines.forEach((line) => {
    if (line.includes('\n')) {
      // Split the line into paragraphs
      const subParagraphs = line.split('\n');
      subParagraphs.forEach((subLine) => {
        currentParagraph += subLine + '\n';
      });
    } else {
      // Trim the line and add it to the current paragraph
      const trimmed = line.trim();
      currentParagraph += trimmed + '\n';
      // If the current paragraph is not empty and ends with a colon, add it to the paragraphs array
      if (currentParagraph.trim().endsWith(':') && currentParagraph.trim() !== ':') {
        paragraphs.push({
          type: 'heading',
          text: currentParagraph.trim().replace(':', ''),
        });
        currentParagraph = '';
      }
      else if (currentParagraph.trim().match(/^[\w\s]+$/) && currentParagraph.trim().length < 80) {
        paragraphs.push({
          type: 'subheading',
          text: currentParagraph.trim(),
        });
        currentParagraph = '';
      }
    }
  });

  if (currentParagraph.trim()) {
    paragraphs.push({
      type: 'paragraph',
      text: currentParagraph.trim(),
    });
  }

  return paragraphs.map((paragraph, index) => {
    const className = paragraph.type === 'heading' ? 'policy-heading' : paragraph.type === 'subheading' ? 'policy-subheading' : 'policy-paragraph';

    return (
      <div key={index} className={className}>
        {paragraph.text}
      </div>
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
