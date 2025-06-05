import React, { useState, useEffect } from "react";
import './PhoneCard.css';
import { useNavigate } from "react-router-dom";

export default function PhoneCard({ device }) {
  const {
    brand = 'Unknown',
    build = 'N/A',
    model = 'N/A',
    price = 0,
    details = {},
    featured = false
  } = device || {};

  const fallbackImage = 'https://via.placeholder.com/300x300?text=No+Image'; 
  const images = Array.isArray(details.images) ? details.images.filter(url => typeof url === 'string') : [];
  const hasImages = images.length > 0;

  const [mainImage, setMainImage] = useState(hasImages ? images[0] : fallbackImage);

  useEffect(() => {
    if (!hasImages) return;

    const intervalId = setInterval(() => {
      setMainImage((current) => {
        const currentIndex = images.indexOf(current);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [images, hasImages]);

  const battery = details.batteryLife || { hours: 'N/A', p: 'N/A' };
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate('/details', { state: { device } });
  };

  return (
    <div className={`phoneCard ${featured ? 'featured' : ''}`}>
      <div className="imageSection">
        <img
          src={mainImage}
          alt={`${brand} ${model}`}
          className="mainImage"
        />
        <div className="thumbnailRow">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`thumb-${i}`}
              className={`thumbnail ${img === mainImage ? "active" : ""}`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
      </div>

      <div className="secondClassDetails">
        <p><strong>RAM / Storage:</strong> {details.RAM || 'N/A'} / {details.storage || 'N/A'} GB</p>
        <p><strong>OS:</strong> {details.os || 'N/A'}</p>
      </div>

      <div className="importantDetails">
        <span>{brand} {model} ({build})</span>
        <span>Ksh. {price.toLocaleString()}</span>
      </div>

      <div className="phoneActions">
        <button className="viewBtn" onClick={handleViewMore}>View More</button>
        <button className="buyBtn" onClick={handleViewMore}>Buy Now</button>
      </div>
    </div>
  );
}
