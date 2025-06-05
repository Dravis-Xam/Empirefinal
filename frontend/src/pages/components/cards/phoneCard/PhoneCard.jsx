import React, { useState, useEffect } from "react";
import './PhoneCard.css';
import { useNavigate } from "react-router-dom";

const BASE_URL = 'https://empirehubphones.onrender.com'

export default function PhoneCard({ device }) {
    const {
        brand = 'Unknown',
        build = 'N/A',
        model = 'N/A',
        price = 0,
        details = {},
        featured = false
      } = device || {};

    const fallbackImage = '/phones/samsungA56.jpg'; 
    const hasImages = details?.images && details.images.length > 0 || fallbackImage;
    const [mainImage, setMainImage] = useState(hasImages ? details.images[0] : "");

    useEffect(() => {
        if (!hasImages) return;

        const intervalId = setInterval(() => {
        setMainImage((current) => {
            const currentIndex = details.images.indexOf(current);
            const nextIndex = (currentIndex + 1) % details.images.length;
            return details.images[nextIndex];
        });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [details.images, hasImages]);

    if (!hasImages) return null;
    const battery = details.batteryLife || { hours: 'N/A', p: 'N/A' };
    const navigate = useNavigate();

    const handleViewMore = () => {
        navigate('/details', { state: { device } });
    };

    return (
        <div className={`phoneCard ${featured ? 'featured' : ''}`}>
            <div className="imageSection">
            <img
                src={`${BASE_URL}/uploads/devices/${mainImage || fallbackImage}`}
                alt={`${brand} ${model}`}
                className="mainImage"
            />
            <div className="thumbnailRow">
                {device.details.images.map((img, i) => (
                    <img
                        key={i}
                        src={`${BASE_URL}/uploads/devices/${img || fallbackImage}`}
                        alt={`thumb-${i}`}
                        className={`thumbnail ${img === mainImage ? "active" : ""}`}
                        onClick={() => setMainImage(img)}
                    />
                    ))}
                </div>
            </div>

            <div className="secondClassDetails">
                <p><strong>RAM / Storage: </strong> {details.RAM} / {details.storage} GB</p>
                <p><strong>OS: </strong> {details.os}</p>
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
