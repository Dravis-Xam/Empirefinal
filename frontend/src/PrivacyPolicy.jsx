import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css';
import Header from './pages/components/sections/header/Header';
import DirectoryNavigation from './pages/components/sections/nav/directoryNav/DirectoryNavigation';

const PrivacyPolicy = () => {
  const [policyText, setPolicyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Privacy Policy - Empire Hub";

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

 const formatLine = (line, key) => {
  const renderInlineBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split around **bold** parts
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  if (line.startsWith('### ')) {
    const content = line.replace(/^###\s\*\*(.*?)\*\*/, '$1');
    return <h3 key={key} className="policy-subheading">{renderInlineBold(content)}</h3>;
  }

  if (line.startsWith('#### ')) {
    const content = line.replace(/^####\s\*\*(.*?)\*\*/, '$1');
    return <h4 key={key} className="policy-subsubheading">{renderInlineBold(content)}</h4>;
  }

  if (line.startsWith('- ')) {
    return <li key={key}>{renderInlineBold(line.replace('- ', ''))}</li>;
  }

  if (line.includes(':') && !line.startsWith('- ')) {
    const [label, ...rest] = line.split(':');
    return (
      <p key={key}>
        <strong>{label}:</strong>
        {renderInlineBold(rest.join(':'))}
      </p>
    );
  }

  return <p key={key}>{renderInlineBold(line)}</p>;
};


  const formatPolicyText = (text) => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const output = [];

    let listBuffer = [];

    lines.forEach((line, index) => {
      if (line.startsWith('- ')) {
        listBuffer.push(line);
      } else {
        if (listBuffer.length) {
          output.push(
            <ul key={`ul-${index}`} className="policy-list">
              {listBuffer.map((li, liIndex) => formatLine(li, `li-${liIndex}`))}
            </ul>
          );
          listBuffer = [];
        }
        output.push(formatLine(line, index));
      }
    });

    // Handle trailing list
    if (listBuffer.length) {
      output.push(
        <ul key={`ul-final`} className="policy-list">
          {listBuffer.map((li, liIndex) => formatLine(li, `li-final-${liIndex}`))}
        </ul>
      );
    }

    return output;
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
              <p>Loading privacy policy...</p>
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