import React, { useState, useEffect } from "react";
import './PhoneCard.css';
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; 

export default function PhoneCard({ device }) {
  const {
    brand,
    build,
    model,
    price ,
    featured,
    images,
    color,
    details
  } = device || {};

  const navigate = useNavigate();

  const f_images = Array.isArray(images)
    ? images.filter(url => typeof url === 'string')
    : [];


  const hasImages = f_images.length > 0;
  const fallbackImage = (
    <DotLottieReact
      src="https://lottie.host/d907efa7-5bff-49e8-8879-72d8c97a44d7/BJJL5Xq85T.lottie"
      loop
      autoplay
    />
  );

  const [mainImage, setMainImage] = useState(hasImages ? images[0] : null);

  useEffect(() => {
    if (!hasImages) return;

    const intervalId = setInterval(() => {
      setMainImage(current => {
        const currentIndex = images.indexOf(current);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [hasImages, images]);

  const handleViewMore = () => {
    navigate('/details', { state: { device } });
  };

  return (
    <div className={`phoneCard ${featured ? 'featured' : ''}`} onClick={handleViewMore}>
      <div className="imageSection">
        {typeof mainImage === 'string'
          ? <img src={mainImage} alt={`${brand} ${model}`} className="mainImage" />
          : fallbackImage}

        {hasImages && (
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
        )}
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
