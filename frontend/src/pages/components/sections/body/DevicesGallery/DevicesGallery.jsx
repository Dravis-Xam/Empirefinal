import React, { useEffect, useRef, useState } from 'react';
import PhoneCard from '../../../cards/phoneCard/PhoneCard';
import './DeviceGallery.css'; 

export default function DeviceGallery() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(300); 
  const [cardsPerView, setCardsPerView] = useState(1); 

  const gap = 20;
  const autoScrollInterval = useRef(null);

  
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      
      if (width <= 500) {
        setCardWidth(width * 0.9); 
        setCardsPerView(1);
      } 
      
      else if (width <= 800) {
        setCardWidth(300);
        setCardsPerView(Math.min(2, Math.floor(width / (300 + gap))));
      } 
      
      else {
        setCardWidth(350);
        setCardsPerView(Math.min(4, Math.floor(width / (350 + gap))));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/devices/get`);
        if (!res.ok) throw new Error('Failed to fetch devices');

        const data = await res.json();
        if (Array.isArray(data)) {
          setDevices(data);
        } else {
          setError('Invalid data format: expected an array of devices');
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setError('Error fetching devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const maxIndex = Math.max(0, devices.length - cardsPerView);

  const movetoNext = () => {
    setSlideIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const movetoPrev = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  
  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      movetoNext();
    }, 20000);
    return () => clearInterval(autoScrollInterval.current);
  }, [cardsPerView, devices]);

  
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;
    let isDragging = false;
    let currentTranslate = 0;

    const onTouchStart = (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      clearInterval(autoScrollInterval.current);
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      currentTranslate = diff;
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentTranslate < -50) {
        movetoNext();
      } else if (currentTranslate > 50) {
        movetoPrev();
      }

      autoScrollInterval.current = setInterval(movetoNext, 20000); 
    };

    slider.addEventListener('touchstart', onTouchStart);
    slider.addEventListener('touchmove', onTouchMove);
    slider.addEventListener('touchend', onTouchEnd);

    return () => {
      slider.removeEventListener('touchstart', onTouchStart);
      slider.removeEventListener('touchmove', onTouchMove);
      slider.removeEventListener('touchend', onTouchEnd);
    };
  }, [slideIndex, cardsPerView, devices]);

  const sliderStyle = {
    transform: `translateX(-${slideIndex * (cardWidth + gap)}px)`,
    transition: 'transform 0.5s ease',
    display: 'flex',
    gap: `${gap}px`,
    touchAction: 'pan-y',
  };

  return (
    <div className="device-gallery-container">
      <div className="gallery-wrapper" ref={containerRef}>
        <button onClick={movetoPrev} className="nav-button prev-button">‹</button>
        
        {loading ? (
          <div className="loading-message">Loading devices...</div>
        ) : error ? (
          <div className="error-message">Unable to load information on available phones</div>
        ) : devices.length === 0 ? (
          <div className="empty-message">No devices available.</div>
        ) : (
          <div ref={sliderRef} className="slider" style={sliderStyle}>
            {devices.map((device) => (
              <div 
                key={device._id} 
                className="card-wrapper"
                style={{ 
                  minWidth: `${cardWidth}px`,
                  width: window.innerWidth <= 500 ? '90vw' : `${cardWidth}px`
                }}
              >
                <PhoneCard device={device} />
              </div>
            ))}
          </div>
        )}
        
        <button onClick={movetoNext} className="nav-button next-button">›</button>
      </div>
    </div>
  );
}