import React, { useState, useEffect } from 'react';
import './MoveToTop.css';

const MoveToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress (0 to 100)
      const progress = Math.min(100, (scrollY / (documentHeight - windowHeight)) * 100);
      setScrollProgress(progress);
      
      // Show button after scrolling 300px
      setIsVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      className={`move-to-top-container ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
    >
      <svg className="progress-circle" viewBox="0 0 36 36">
        <path
          className="circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="circle-fill"
          strokeDasharray={`${scrollProgress}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <svg className="arrow-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
      </svg>
    </div>
  );
};

export default MoveToTop;