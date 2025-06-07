import React, { useState, useEffect, useMemo } from "react";
import './DetailPage.css';
import Header from "./components/sections/header/Header";
import RhombusLoader from './components/loading/RhombusLoading';
import { useCart } from "../modules/Store/CartContext";
import DirectoryNavigation from "./components/sections/nav/directoryNav/DirectoryNavigation";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "../modules/Store/ToastStore";
import ToastContainer from "./components/toasts/ToastContainer";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// import PropTypes from 'prop-types';

const BASE_URL = `https://empirehubphones.onrender.com`

export default function DetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const device = state?.device;

  const { cart, addToCart, removeFromCart } = useCart();
  const fallbackImage = '/public/phones/samsungA56.jpg'; 

  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [images, setImages] = useState([]);

  // Memoized device data with fallbacks
  const deviceData = useMemo(() => {
    if (!device) return null;
    
    return {
      brand: device.brand || 'Unknown',
      build: device.build || 'N/A',
      model: device.model || 'N/A',
      price: device.price || 0,
      details: {
        ...device.details,
        images: device?.details?.images || [],
        colors: device.details?.colors || [],
        storage: device.details?.storage || 0,
        RAM: device.details?.RAM || 0,
        processorType: device.details?.processorType || 'Not specified',
        CAMResolution: device.details?.CAMResolution || [],
        os: device.details?.os || 'Not specified',
        batteryLife: Array.isArray(device.details?.batteryLife) 
          ? device.details.batteryLife[0] || { hours: 'N/A', p: 'N/A' }
          : device.details?.batteryLife || { hours: 'N/A', p: 'N/A' }
      }
    };
  }, [device]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, []);

 useEffect(() => {
  if (!deviceData) return;
  
  const validImages = device.details?.images?.filter(img => typeof img === 'string' && img.startsWith('http'));
  const finalImages = validImages.length > 0 ? validImages : [fallbackImage];

  setMainImage(finalImages[0]);
  setImages(finalImages);
}, [deviceData]);


  const handleColorSelect = (color) => {
    toast.success(`Selected color: ${color}`);
  };

  const cartItem = useMemo(() => ({
    brand: deviceData?.brand,
    build: deviceData?.build,
    model: deviceData?.model,
    price: deviceData?.price,
    details: deviceData?.details
  }), [deviceData]);

  const quantity = useMemo(() => (
    cart.filter(p => 
      p.build === deviceData?.build && 
      p.model === deviceData?.model
    ).length
  ), [cart, deviceData]);

  const handleAddToCart = () => {
    if (!deviceData) return;
    addToCart(cartItem);
    toast.success(`${deviceData.brand} ${deviceData.model} added to cart`);
  };
  
  const handleRemoveFromCart = () => {
    if (quantity === 0) return;
    removeFromCart(cartItem);
    toast.success(`${deviceData?.brand} ${deviceData?.model} removed from cart`);
  };

  if (loading) return <RhombusLoader />;

  if (!deviceData) {
    return (
      <div className="detailPage">
        <Header />
        <DirectoryNavigation />
        <div className="error-state">
          <p>No device data found.</p>
          <button 
            onClick={() => navigate('/')} 
            className="home-button"
            aria-label="Return to home page"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detailPage">
      <Header />
      <DirectoryNavigation />

      <section aria-labelledby="product-title">
        <h1 id="product-title">{deviceData.brand} {deviceData.model}</h1>
        <small>({deviceData.build})</small>
      </section>

      <div className="productLayout">
        <div className="productDetails">
          <ul>
            {deviceData.details.colors.length > 0 && (
              <li>
                <strong>Colors:</strong>
                <div className="color-options" role="group" aria-label="Available colors">
                  {deviceData.details.colors.slice(0, 2).map((color, index) => (
                    <button 
                      key={index}
                      className="color-button"
                      style={{ 
                        backgroundColor: color,
                        border: color === '#FFFFFF' ? '1px solid #ddd' : 'none'
                      }}
                      aria-label={`Select ${color} color`}
                      onClick={() => handleColorSelect(color)}
                      onKeyDown={(e) => e.key === 'Enter' && handleColorSelect(color)}
                      tabIndex={0}
                    />
                  ))}
                </div>
              </li>
            )}
            
            <li>
              <strong>Camera resolutions:</strong>
              <div className="cameraResolutions">
                {deviceData.details.CAMResolution.length > 0 ? (
                  deviceData.details.CAMResolution.map((res, i) => (
                    <span className="camBadge" key={i}>{res}MP</span>
                  ))
                ) : (
                  <span className="camBadge noData">No camera data</span>
                )}
              </div>
            </li>

            <li><strong>Processor:</strong> {deviceData.details.processorType}</li>
            <li><strong>OS:</strong> {deviceData.details.os}</li>
            <li>
              <strong>Battery:</strong> {deviceData.details.batteryLife.p} mAh – {deviceData.details.batteryLife.hours} hrs
            </li>
          </ul>
        </div>

        <div className="imageSection">
          {mainImage ? (
            <DotLottieReact
              src="https://lottie.host/d907efa7-5bff-49e8-8879-72d8c97a44d7/BJJL5Xq85T.lottie"
              loop
              autoplay
              style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }}
            />
          ) : (
            <img 
              src={mainImage} 
              alt={`${deviceData.brand} ${deviceData.model}`} 
              className="mainImage"
              loading="lazy"
            />
          )}

          {images.length > 1 && (
            <div className="thumbnailRow">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i + 1} of ${deviceData.brand} ${deviceData.model}`}
                  className={`thumbnail ${img === mainImage ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                  onKeyDown={(e) => e.key === 'Enter' && setMainImage(img)}
                  tabIndex={0}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>


        <div className="productPriceBlock">
          <h3>Specs</h3>
          <p><strong>RAM:</strong> {deviceData.details.RAM} GB</p>
          <p><strong>Storage:</strong> {deviceData.details.storage} GB</p>
          <p><strong>Price:</strong> Ksh. {deviceData.price.toLocaleString()}</p>
          
          <div className="addToCartBtnsContainer">
            <button 
              className="addItemBtn" 
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              +
            </button>
            <span aria-live="polite">{quantity} in cart</span>
            <button
              className="removeItemBtn"
              onClick={handleRemoveFromCart}
              disabled={quantity === 0}
              aria-label="Remove from cart"
            >
              -
            </button>
          </div>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

// Uncomment if using PropTypes
// DetailPage.propTypes = {
//   // Add your prop types here
// };