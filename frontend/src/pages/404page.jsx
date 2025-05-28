import DirectoryNavigation from "./components/sections/nav/directoryNav/DirectoryNavigation";
import { useEffect } from "react";
import "./PageNotFound.css";

export default function PageNotFound() {
  useEffect(() => {
    document.title = "404 Page Not Found | Empire Hub Phones Kenya";
  }, []);

  return (
    <div className="not-found-container">
      <DirectoryNavigation />
      
      <div className="not-found-content">
        <div className="not-found-graphic">
          <div className="not-found-number">4</div>
          <div className="not-found-icon">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,7H13V9H11V7M11,11H13V17H11V11Z" />
            </svg>
          </div>
          <div className="not-found-number">4</div>
        </div>
        
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="not-found-actions">
          <a href="/" className="not-found-button primary">
            Return Home
          </a>
          <a href="/contact" className="not-found-button secondary">
            Contact Support
          </a>
        </div>
      </div>
      
      <div className="not-found-decoration">
        <div className="circle gold"></div>
        <div className="circle blue"></div>
        <div className="circle small gold"></div>
      </div>
    </div>
  );
}