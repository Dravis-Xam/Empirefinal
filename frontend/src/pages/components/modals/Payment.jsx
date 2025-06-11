// --- React Component: Payment.js ---
import React, { useState, useEffect } from "react";
import './styles.css';
import { useCart } from "../../../modules/Store/CartContext";
import DirectoryNavigation from "../sections/nav/directoryNav/DirectoryNavigation";
import ToastContainer from "../toasts/ToastContainer";
import { toast } from "../../../modules/Store/ToastStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/Store/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import PesapalPayButton from "./Pesapalbtn";

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Payment() {
  const navigate = useNavigate();
  const { cart, setPaymentInfo, setDeliveryInfo, clearCart } = useCart();
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [ccName, setCCName] = useState("");
  const [ccEmail, setCCEmail] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  //const [paypalEmail, setPaypalEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const { user } = useAuth();
  const t_ID = uuidv4()

  const [location, setLocation] = useState({
    county: "",
    town: "",
    street: "",
    roomNo: ""
  });

  useEffect(() => {
    const savedLocation = JSON.parse(localStorage.getItem("deliveryLocation"));
    if (savedLocation) setLocation(savedLocation);

    const savedPayment = JSON.parse(localStorage.getItem("paymentInfo"));
    if (savedPayment) {
      setPaymentMethod(savedPayment.method);
      setCCName(savedPayment.ccName || "");
      setMpesaNumber(savedPayment.mpesaNumber || "");
      setPaypalEmail(savedPayment.paypalEmail || "");
      setContactNumber(savedPayment.contactNumber || "");
    }
  }, []);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const validateLocation = () => {
    const requiredFields = ["county", "town", "street"];
    for (const field of requiredFields) {
      if (!location[field].trim()) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    return true;
  };

  const validatePhone = (phone) => {
    return /^(\+?254|0)?7\d{8}$/.test(phone);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveLocation = () => {
    if (!validateLocation()) return;
    if (!validatePhone(contactNumber)) {
      return toast.error("Please enter a valid Kenyan phone number.");
    }
    localStorage.setItem("deliveryLocation", JSON.stringify(location));
    toast.success("Location saved successfully!");
  };

  let details = {}

  const handleCompletePurchase = async () => {
    const username = localStorage.getItem('username') || 'guest_user';
    if (!paymentMethod) return toast.error("Please select a payment method.");
    if (!validateLocation()) return;
    if (!validatePhone(contactNumber)) return toast.error("Invalid contact number.");
    if (!t_ID.trim()) return toast.error("Please enter transaction code.");

    let details = {};
    if (paymentMethod === "mpesa") {
      if (!validatePhone(mpesaNumber)) return toast.error("Invalid Mpesa number.");
      details = { number: mpesaNumber };
    } /*else if (paymentMethod === "paypal") {
      if (!validateEmail(paypalEmail)) return toast.error("Invalid PayPal email address.");
      details = { email: paypalEmail };
    } else if (paymentMethod === "bank") {
      if (!bankType) return toast.error("Please select a bank card type.");
      details = { cardType: bankType, cardNumber: '**** **** **** 1234' };
    }*/

    const payload = {
      username,
      contact: contactNumber,
      coordinates: location,
      items: {
        devices: cart.map(item => ({
          name: `${item.brand} ${item.model}`,
          price: item.price,
          quantity: item.quantity || 1
        })),
        totalPrice: totalAmount,
        age: cart[0]?.details?.age || " "
      },
      status: 'pending delivery',
      paymentDetails: {
        method: paymentMethod,
        details: {
          t_id: t_ID && uuidv4(),
          pay: totalAmount,
          currency: 'Ksh',
          ...details
        }
      }
    };

    try {
      const response = await fetch(`${BASE_URL}/api/buy/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) return toast.error(`Error: ${result.message}`);


      setPaymentInfo({ method: paymentMethod, bankType, mpesaNumber, paypalEmail, contactNumber, totalAmount });
      setDeliveryInfo(location);
      toast.success('Purchase completed successfully!');


      localStorage.setItem("paymentInfo", JSON.stringify({
        method: paymentMethod,
        bankType,
        mpesaNumber,
        paypalEmail,
        contactNumber,
        totalAmount
      }));

      localStorage.setItem("deliveryLocation", JSON.stringify(location));
      clearCart();
    } catch (err) {
      toast.error('Something went wrong while completing the purchase.');
    }
  };

  const handleTrackDelivery = () => {
    localStorage.setItem('delivery', 'ongoing');
    navigate('/track-delivery', {
      state: {
        t_ID,
        status: 'pending delivery'
      }
    });
  };

  return (
    <div className="payment-container">
      <DirectoryNavigation />
      <h1>Payment & Delivery</h1>
      <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>

      <div className="sections">
        <section className="payment-section">
          <h3>Select Payment Method</h3>
          <label><input type="radio" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Credit Card Payment</label>
          {paymentMethod === "card" && (
            <div className="sub-option">
              <label>Name as per id:
                <input type="text" value={ccName} onChange={(e) => setCCName(e.target.value)} placeholder="Enter your name" />
              </label>
              <label>Email:
                <input type="email" value={ccEmail} onChange={(e) => setCCEmail(e.target.value)} placeholder="Enter your email" />
              </label>
              <PesapalPayButton 
                name={ccName}
                email={ccEmail}
                phone={contactNumber}
                amount={totalAmount}
              />
            </div>
          )}
          <label><input type="radio" value="mpesa" checked={paymentMethod === "mpesa"} onChange={() => setPaymentMethod("mpesa")} /> Mpesa Payment</label>
          {paymentMethod === "mpesa" && (
            <div className="sub-option">
              <label>Mpesa Number:
                <input type="text" value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} placeholder="Enter Mpesa number" />
              </label>
            </div>
          )}
{/** 
          <label><input type="radio" value="paypal" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} /> PayPal</label>
          {paymentMethod === "paypal" && (
            <div className="sub-option">
              <label>PayPal Email:
                <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="Enter PayPal email" />
              </label>
            </div>
          )}*/}
        </section>

        <section className="delivery-section">
          <h3>Delivery Location</h3>
          <form>
            {['county', 'town', 'street', 'roomNo'].map((field) => (
              <div key={field} className="inputContainer">
                <input name={field} value={location[field]} onChange={handleLocationChange} required/>
                <label className="floatingLabel">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              </div>
            ))}
            <div className="inputContainer">
              <input name="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required/>
              <label className="floatingLabel">Contact number</label>
            </div>
            {/** <div className="inputContainer">
              <input name="t_id" value={t_ID} onChange={(e) => setTIDCode(e.target.value)} />
              <label className="floatingLabel">Transaction code</label>
            </div>*/}
          </form>
          <button type="button" onClick={handleSaveLocation} className="save-location-btn">Save</button>
        </section>
      </div>

      <div className="checkout-buttons">
        <button onClick={handleCompletePurchase} disabled={paymentMethod==="card"}>Complete Purchase</button>
        <button onClick={handleTrackDelivery}>Track Delivery</button>
      </div>

      <ToastContainer />
    </div>
  );
}