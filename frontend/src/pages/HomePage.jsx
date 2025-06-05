import React, { useState, useEffect } from "react";
import './homepage.css';
import { useNavigate } from "react-router-dom";
import DirectoryNavigation from './components/sections/nav/directoryNav/DirectoryNavigation';
import PhoneCard from "./components/cards/phoneCard/PhoneCard";
import Header from "./components/sections/header/Header";
import SocialLinks from "./components/links/SocialLinks/SocialLink";
import RhombusLoader from "./components/loading/RhombusLoading";
import messageicon from '../assets/icons/message.png';
import herobackground from '../assets/photos/herobackground.png';
import DeviceGallery from "./components/sections/body/DevicesGallery/DevicesGallery";
import MoveToTop from "./components/buttons/movetotop/MoveToTop";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  };

  const navigateSearch = () => {
    navigate('/search');
  };

  const handleTagClick = (q) => {
    navigate('/search', {state: q});
  }

  const style = {
    backgroundImage: `url(${herobackground})`,
    backgroundSize: 'cover', 
    backgroundPosition: 'center',  
    backgroundRepeat: 'no-repeat', 
  };
  

  if (loading) return <RhombusLoader />;

  return (
    <div className="homePage">
      <section className="hero" style={style}>
        <span className="headerContainer"><Header /></span>
        <h1>Explore our wide variety of phones and accessories</h1>
        <div className="brands categorySection">
          <span onClick={() => handleTagClick("samsung")}>Samsung</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick("iphone")}>Iphone</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick('infinix')}>Infinix</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick('huawei')}>Oraimo</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick('redmi')}>Redmi</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick('realme')}>UBL</span><small className="separator">|</small>
          <span onClick={() =>handleTagClick('oppo')}>OPPO</span>
        </div>
      </section>

      <section className="phonesContainer">
        <h1>Available Phones</h1>
        <DeviceGallery />
      </section>

      <section className="et000">
        <div className="serviceCard">
          <h3>Delivery</h3>
          <p>We offer country-wide on-time deliveries</p>
        </div>
        <div className="serviceCard">
          <h3>Customer support</h3>
          <p>We are online 24/7 to ensure you get all the help you need.</p>
        </div>
        <div className="serviceCard">
          <h3>Warranty</h3>
          <p>Our phones come with a 1-2 year warranty.</p>
        </div>
      </section>

      {/*<div className="supportChatLink"><img src={messageicon} alt="..." /><span>Chat with us for support or feedback</span></div>*/}
    <MoveToTop />
      <footer>
        <div>
          <div>
            <h2>Empire Hub Phones</h2>
            <p><strong>Location: </strong>Moi avenue, bazaar plaza, floor M1, Unit 3, Shop A2</p>
            <p><strong>Email: </strong>empirehub254@gmail.com</p>
            <p><strong>Contact: </strong> 0700 029 555 / 0700 023 555</p>
            <SocialLinks />
          </div>
          <div>
            <h3>Our Company</h3>
            <ul>
              <li><a onClick={()=>navigate('/about-us')}>About us</a></li>
              <li><a onClick={()=> navigate('/contact-us')}>Contact us</a></li>
              <li><a >Docs</a></li>
              <li><a onClick={() => navigate("/privacy-policy")}>Privacy policy</a></li>
            </ul>
          </div>
          <div>
            <h3>Brands</h3>
            <ul>
              <li><a onClick={()=> handleTagClick('samsung')}>Samsung</a></li>
              <li><a onClick={()=> handleTagClick('apple')}>Apple</a></li>
              <li><a onClick={()=> handleTagClick('oneplus')}>Oneplus</a></li>
              <li><a onClick={()=> handleTagClick('infinix')}>Infinix</a></li>
            </ul>
          </div>
        </div>
        <small>&copy; 2025 | Empire Hub Phones | Terms and conditions apply.</small>
      </footer>
    </div>
  );
}
