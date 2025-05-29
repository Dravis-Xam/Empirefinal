import Header from './pages/components/sections/header/Header'
import DirectoryNavigation from './pages/components/sections/nav/directoryNav/DirectoryNavigation'
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <Header /><DirectoryNavigation />
      <div className="privacy-policy-card">
        <h1 className="policy-title">Privacy Policy</h1>
        <h2 className="policy-subtitle">Empire Hub Phones</h2>

        <div className="policy-last-updated">
          Last Updated: 2025/5/29
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2 className="section-heading">1. Introduction</h2>
            <p>
              This Privacy Policy describes how <strong>Empire Hub Phones</strong> ("the Site", "we", "us", or "our") collects, uses, and discloses your personal information when you:
            </p>
            <ul>
              <li>Visit or use our website: <strong>https://empirefinal-osrw.vercel.app</strong> ("the Site")</li>
              <li>Use our services or make a purchase</li>
              <li>Communicate with us regarding the Site (collectively, "the Services")</li>
            </ul>
            <p>
              <strong>Definitions:</strong><br />
              "You" and "your" refer to users of the Services, including customers, website visitors, or individuals whose information we collect under this policy.
            </p>
            <p>
              By using the Services, you agree to the terms of this Privacy Policy. If you disagree, please refrain from using the Services.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">2. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy periodically to reflect changes in practices, legal requirements, or operational needs. Updates will be posted on the Site with a revised "Last updated" date.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">3. How We Collect and Use Your Personal Information</h2>
            <p>
              We collect personal information from various sources to provide and improve the Services. This includes:
            </p>
            <ul>
              <li>Communicating with you</li>
              <li>Fulfilling legal obligations</li>
              <li>Enforcing terms of service</li>
              <li>Protecting user rights</li>
            </ul>

            <h3 className="section-subheading">Categories of Personal Information Collected:</h3>
            <h4>1. Information You Provide Directly:</h4>
            <ul>
              <li>Contact details (name, address, phone, email)</li>
              <li>Order information (billing/shipping address, payment confirmation)</li>
              <li>Account details (username, password, security questions)</li>
              <li>Shopping activity (viewed items, cart contents, loyalty points, reviews)</li>
              <li>Customer support communications</li>
            </ul>

            <h4>2. Usage Data:</h4>
            <ul>
              <li>Automatically collected via cookies, pixels, and similar technologies</li>
              <li>Includes device, browser, IP address, and interaction data</li>
            </ul>

            <h4>3. Information from Third Parties:</h4>
            <ul>
              <li>Vendors (e.g., Shopify, payment processors)</li>
              <li>Marketing and analytics partners</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">4. How We Use Your Information</h2>
            <ul>
              <li><strong>Service Provision:</strong> Process payments, fulfill orders, manage accounts, and facilitate returns.</li>
              <li><strong>Marketing:</strong> Send promotional emails/texts; display targeted ads.</li>
              <li><strong>Security:</strong> Detect and prevent fraud.</li>
              <li><strong>Improvements:</strong> Enhance Services and customer support.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">5. Cookies</h2>
            <p>We use cookies to:</p>
            <ul>
              <li>Power and improve the Site</li>
              <li>Analyze user interaction</li>
              <li>Enable third-party services (e.g., Shopify)</li>
            </ul>
            <p>
              <strong>Managing Cookies:</strong> Adjust browser settings to block or remove cookies, though this may affect functionality.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">6. Disclosure of Personal Information</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> IT, payment processors, shipping partners</li>
              <li><strong>Business Partners:</strong> For advertising and services</li>
              <li><strong>Legal Compliance:</strong> In response to subpoenas or fraud investigations</li>
              <li><strong>Business Transfers:</strong> During mergers or bankruptcy</li>
            </ul>
            <p><strong>Categories Shared:</strong> Identifiers, commercial data, internet activity, and geolocation.</p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">7. Third-Party Links</h2>
            <p>
              Our Site may link to external platforms. We are not responsible for their privacy practices. Review their policies before sharing information.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">8. Children’s Data</h2>
            <p>
              The Services are not intended for children under 16. We do not knowingly collect their data. Parents may contact us to request deletion.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">9. Security and Retention</h2>
            <ul>
              <li>No security measure is 100% secure; avoid transmitting sensitive data via insecure channels.</li>
              <li>Retention periods depend on legal, operational, or account needs.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">10. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access, delete, or correct your data</li>
              <li>Port data to third parties</li>
              <li>Restrict processing or withdraw consent</li>
              <li>Opt out of promotional emails (non-promotional emails will continue)</li>
            </ul>
            <p>
              <strong>How to Exercise Rights:</strong> Contact us using the details below. We will verify your identity before processing requests.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">11. Complaints</h2>
            <p>
              Contact us with privacy concerns. If unsatisfied, you may appeal or lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">12. International Users</h2>
            <p>
              Your data may be transferred/stored outside your country. Transfers from Europe use safeguards like Standard Contractual Clauses.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="section-heading">13. Contact Us</h2>
            <p>For questions or to exercise your rights:</p>
            <ul>
              <li><strong>Email:</strong> empirehub254@gmail.com</li>
              <li><strong>Address:</strong> Moi Avenue, Bazaar Plaza, Floor M1, Unit 3, Shop A2, KE</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;