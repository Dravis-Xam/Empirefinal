import React, { useEffect, useRef, useState } from 'react';
import PhoneCard from '../../../cards/phoneCard/PhoneCard';

export default function DeviceGallery() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const cardWidth = 250;
  const gap = 10;
  const autoScrollInterval = useRef(null);

  const [cardsPerView, setCardsPerView] = useState(1);

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

  useEffect(() => {
    const updateCardsPerView = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const totalCardWidth = cardWidth + gap;
        setCardsPerView(Math.floor(containerWidth / totalCardWidth));
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, devices.length - cardsPerView);

  const movetoNext = () => {
    setSlideIndex((prev) => (prev < maxIndex ? prev + 1 : 0)); // loop back
  };

  const movetoPrev = () => {
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : maxIndex)); // loop back
  };

  // Auto-scroll
  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      movetoNext();
    }, 4000); // 4 seconds
    return () => clearInterval(autoScrollInterval.current);
  }, [cardsPerView, devices]);

  // Touch / Drag Handling
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

      // You could shift preview here if needed
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

      autoScrollInterval.current = setInterval(movetoNext, 4000); // restore
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
    <div className="phoneCardsContainer" style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      <div className="phonesContainer" ref={containerRef} style={{ width: '94%', margin: 'auto', overflow: 'hidden' }}>
        <button onClick={movetoPrev} className="prev-button">‹</button>
        {loading ? (
          <p>Loading devices...</p>
        ) : error ? (
          <p>Unable to load information on available phones</p>
        ) : devices.length === 0 ? (
          <p>No devices available.</p>
        ) : (
          <div ref={sliderRef} className="slider" style={sliderStyle}>
            {devices.map((device) => (
              <div key={device._id} style={{ minWidth: `${cardWidth}px`, flex: '0 0 auto' }}>
                <PhoneCard device={device} />
              </div>
            ))}
          </div>
        )}
        <button onClick={movetoNext} className="next-button">›</button>
      </div>
    </div>
  );
}
