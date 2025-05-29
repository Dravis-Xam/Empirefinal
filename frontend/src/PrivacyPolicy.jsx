import React, { useState, useEffect } from 'react';
import './PrivacyPolicy.css';
import Header from './pages/components/sections/header/Header';
import DirectoryNavigation from './pages/components/sections/nav/directoryNav/DirectoryNavigation';

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Privacy Policy - Empire Hub";
  }, []);

  const renderInlineBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  return (
    <>
      <Header />
      <DirectoryNavigation />
      <main className="privacy-policy-container">
        <article className="privacy-policy-card">
          <h1 className="policy-title">Privacy Policy</h1>
          <div className="policy-last-updated">Last Updated: 2025/5/29</div>

          <div className="policy-content">
            <p>{renderInlineBold('**Privacy Policy**')}</p>
            <p>{renderInlineBold('**Empire Hub Phones**')}</p>

            <h3 className="policy-subheading">{renderInlineBold('### **1. Introduction**')}</h3>
            <p>{renderInlineBold('This Privacy Policy describes how **Empire Hub Phones** ("the Site," "we," "us," or "our") collects, uses, and discloses your personal information when you:')}</p>
            <ul className="policy-list">
              <li>{renderInlineBold('Visit or use our website: **https://empirefinal-osrw.vercel.app** ("the Site").')}</li>
              <li>Use our services or make a purchase.</li>
              <li>Communicate with us regarding the Site (collectively, "the Services").</li>
            </ul>
            <p>{renderInlineBold('**Definitions**:')}</p>
            <ul className="policy-list">
              <li>{renderInlineBold('"You" and "your" refer to users of the Services, including customers, website visitors, or individuals whose information we collect under this policy.')}</li>
            </ul>
            <p>By using the Services, you agree to the terms of this Privacy Policy. If you disagree, please refrain from using the Services.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **2. Changes to This Privacy Policy**')}</h3>
            <p>We may update this policy periodically to reflect changes in practices, legal requirements, or operational needs. Updates will be posted on the Site with a revised "Last updated" date.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **3. How We Collect and Use Your Personal Information**')}</h3>
            <p>We collect personal information from various sources to provide and improve the Services. This includes:</p>
            <ul className="policy-list">
              <li>Communicating with you.</li>
              <li>Fulfilling legal obligations.</li>
              <li>Enforcing terms of service.</li>
              <li>Protecting user rights.</li>
            </ul>

            <h4 className="policy-subsubheading">{renderInlineBold('#### **Categories of Personal Information Collected:**')}</h4>
            <ol className="policy-list">
              <li>
                <strong>Information You Provide Directly:</strong>
                <ul>
                  <li>Contact details (name, address, phone, email).</li>
                  <li>Order information (billing/shipping address, payment confirmation).</li>
                  <li>Account details (username, password, security questions).</li>
                  <li>Shopping activity (viewed items, cart contents, loyalty points, reviews).</li>
                  <li>Customer support communications.</li>
                </ul>
              </li>
              <li>
                <strong>Usage Data:</strong>
                <ul>
                  <li>Automatically collected via cookies, pixels, and similar technologies.</li>
                  <li>Includes device, browser, IP address, and interaction data.</li>
                </ul>
              </li>
              <li>
                <strong>Information from Third Parties:</strong>
                <ul>
                  <li>Vendors (e.g., Shopify, payment processors).</li>
                  <li>Marketing and analytics partners.</li>
                </ul>
              </li>
            </ol>

            <h3 className="policy-subheading">{renderInlineBold('### **4. How We Use Your Information**')}</h3>
            <ul className="policy-list">
              <li>{renderInlineBold('**Service Provision:** Process payments, fulfill orders, manage accounts, and facilitate returns.')}</li>
              <li>{renderInlineBold('**Marketing:** Send promotional emails/texts; display targeted ads.')}</li>
              <li>{renderInlineBold('**Security:** Detect and prevent fraud.')}</li>
              <li>{renderInlineBold('**Improvements:** Enhance Services and customer support.')}</li>
            </ul>

            <h3 className="policy-subheading">{renderInlineBold('### **5. Cookies**')}</h3>
            <p>We use cookies to:</p>
            <ul className="policy-list">
              <li>Power and improve the Site.</li>
              <li>Analyze user interaction.</li>
              <li>Enable third-party services (e.g., Shopify).</li>
            </ul>
            <p>{renderInlineBold('**Managing Cookies:** Adjust browser settings to block or remove cookies, though this may affect functionality.')}</p>

            <h3 className="policy-subheading">{renderInlineBold('### **6. Disclosure of Personal Information**')}</h3>
            <p>We may share your information with:</p>
            <ul className="policy-list">
              <li>{renderInlineBold('**Service Providers:** IT, payment processors, shipping partners.')}</li>
              <li>{renderInlineBold('**Business Partners:** For advertising and services.')}</li>
              <li>{renderInlineBold('**Legal Compliance:** In response to subpoenas or fraud investigations.')}</li>
              <li>{renderInlineBold('**Business Transfers:** During mergers or bankruptcy.')}</li>
            </ul>
            <p>{renderInlineBold('**Categories Shared:** Identifiers, commercial data, internet activity, and geolocation.')}</p>

            <h3 className="policy-subheading">{renderInlineBold('### **7. Third-Party Links**')}</h3>
            <p>Our Site may link to external platforms. We are not responsible for their privacy practices. Review their policies before sharing information.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **8. Children’s Data**')}</h3>
            <p>The Services are not intended for children under 16. We do not knowingly collect their data. Parents may contact us to request deletion.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **9. Security and Retention**')}</h3>
            <ul className="policy-list">
              <li>No security measure is 100% secure; avoid transmitting sensitive data via insecure channels.</li>
              <li>Retention periods depend on legal, operational, or account needs.</li>
            </ul>

            <h3 className="policy-subheading">{renderInlineBold('### **10. Your Rights**')}</h3>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="policy-list">
              <li>Access, delete, or correct your data.</li>
              <li>Port data to third parties.</li>
              <li>Restrict processing or withdraw consent.</li>
              <li>Opt out of promotional emails (non-promotional emails will continue).</li>
            </ul>
            <p>{renderInlineBold('**How to Exercise Rights:** Contact us using the details below. We will verify your identity before processing requests.')}</p>

            <h3 className="policy-subheading">{renderInlineBold('### **11. Complaints**')}</h3>
            <p>Contact us with privacy concerns. If unsatisfied, you may appeal or lodge a complaint with your local data protection authority.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **12. International Users**')}</h3>
            <p>Your data may be transferred/stored outside your country. Transfers from Europe use safeguards like Standard Contractual Clauses.</p>

            <h3 className="policy-subheading">{renderInlineBold('### **13. Contact Us**')}</h3>
            <p>For questions or to exercise your rights:</p>
            <address>
              <strong>Email:</strong> empirehub254@gmail.com<br />
              <strong>Address:</strong> Moi Avenue, Bazaar Plaza, Floor M1, Unit 3, Shop A2, KE.
            </address>
          </div>
        </article>
      </main>
    </>
  );
};

export default PrivacyPolicy;
