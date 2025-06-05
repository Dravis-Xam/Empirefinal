import React, { useState, useEffect } from "react";
import './DetailPage.css';
import Header from "./components/sections/header/Header";
import RhombusLoader from './components/loading/RhombusLoading';
import { useCart } from "../modules/Store/CartContext";
import DirectoryNavigation from "./components/sections/nav/directoryNav/DirectoryNavigation";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "../modules/Store/ToastStore";
import ToastContainer from "./components/toasts/ToastContainer";

export default function DetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const device = state?.device;

  const { cart, addToCart, removeFromCart } = useCart();
  const fallbackImage = '/phones/samsungA56.jpg';

  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(fallbackImage);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const deviceImages = device?.details?.images || [];
    if (deviceImages.length > 0) {
      setMainImage(deviceImages[0]);
    } else {
      setMainImage(fallbackImage);
    }
  }, [device]);

  if (loading) return <RhombusLoader />;

  if (!device) {
    return (
      <div className="detailPage">
        <Header />
        <DirectoryNavigation />
        <p>No device data found.</p>
        <button onClick={() => navigate('/')} style={{maxWidth: "150px"}}>Go Home</button>
      </div>
    );
  }

  const {
    brand = 'Unknown',
    build = 'N/A',
    model = 'N/A',
    price = 0,
    details = {},
  } = device;

  const {
    images = [],
    colors = [],
    storage = 0,
    RAM = 0,
    processorType = null,
    CAMResolution = [],
    os = null,
    batteryLife = { hours: 'N/A', p: 'N/A' }
  } = details;

  const battery = Array.isArray(batteryLife) && batteryLife.length > 0
    ? batteryLife[0]
    : batteryLife || { hours: 'N/A', p: 'N/A' };

  const item = { brand, build, model, price, details };
  const quantity = cart.filter(p => p.build === build && p.model === model).length;

  const handleAddToCart = () => {
    toast.success("Item added")
    addToCart(item)};
  
  const handleRemoveFromCart = () => {
    if (quantity > 0) removeFromCart(item);
    toast.success("Item removed")
  };

  return (
    <div className="detailPage">
      <Header />
      <DirectoryNavigation />

      <span>
        <h1>{brand} {model}</h1>
        <small>({build})</small>
      </span>

      <div className="productLayout">
        <div className="productDetails">
          <ul>
            {colors.length > 0 && (
              <li>
                <strong>Colors:</strong>
                <div className="color-options">
                  {colors.slice(0, 2).map((color, index) => (
                    <button 
                      key={index}
                      className="color-button"
                      style={{ backgroundColor: color }}
                      aria-label={color}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </li>
            )}
            <li>
              <strong>Camera resolutions:</strong>
              <div className="cameraResolutions">
                {CAMResolution.length > 0 ? (
                  CAMResolution.map((res, i) => (
                    <span className="camBadge" key={i}>{res}</span>
                  ))
                ) : (
                  <span className="camBadge noData">No camera data</span>
                )}
              </div>
            </li>
            { processorType && <li><strong>Processor:</strong> {processorType}</li>}
            {os && <li><strong>OS:</strong> {os}</li>}
            <li><strong>Battery:</strong> {battery.p} mAh – {battery.hours} hrs</li>
          </ul>
        </div>

        <div className="imageSection">
          <img src={mainImage} alt={`${brand} ${model}`} className="mainImage" />
          {images.length > 0 && (
            <div className="thumbnailRow">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  className={`thumbnail ${img === mainImage ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="productPriceBlock">
          <h3>Specs</h3>
          <p><strong>RAM:</strong> {RAM} GB</p>
          <p><strong>Storage:</strong> {storage} GB</p>
          <p><strong>Price:</strong> Ksh. {price.toLocaleString()}</p>
          <div className="addToCartBtnsContainer">
            <button className="addItemBtn" onClick={handleAddToCart}>+</button>
            <span>{quantity} in cart</span>
            <button
              className="removeItemBtn"
              onClick={handleRemoveFromCart}
              disabled={quantity === 0}
            >
              -
            </button>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
}