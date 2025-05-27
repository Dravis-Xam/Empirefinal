// --- React Component: Payment.js ---
import React, { useState, useEffect } from "react";
import './styles.css';
import { useCart } from "../../../modules/Store/CartContext";
import DirectoryNavigation from "../sections/nav/directoryNav/DirectoryNavigation";
import ToastContainer from "../toasts/ToastContainer";
import { toast } from "../../../modules/Store/ToastStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/Store/AuthContext";
import { runSTK } from "../../../modules/STK/stkpush.js";
import { v4 as uuidv4 } from 'uuid';

export default function Payment() {
  const navigate = useNavigate();
  const { cart, setPaymentInfo, setDeliveryInfo, clearCart } = useCart();
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankType, setBankType] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
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
      setBankType(savedPayment.bankType || "");
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
    if (!t_id.trim()) return toast.error("Please enter transaction code.");

    let details = {};
    if (paymentMethod === "mpesa") {
      if (!validatePhone(mpesaNumber)) return toast.error("Invalid Mpesa number.");
      details = { number: mpesaNumber };
      
      try {
        await runSTK({ mpesaNumber, totalAmount }); // ✅ call STK push here
      } catch (err) {
        console.error(err);
        return toast.error("STK Push failed.");
      }
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
          t_id: t_ID,
          pay: totalAmount,
          currency: 'Ksh',
          ...details
        }
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/buy/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) return toast.error(`Error: ${result.message}`);

      localStorage.setItem("paymentInfo", JSON.stringify({
        method: paymentMethod,
        bankType,
        mpesaNumber,
        paypalEmail,
        contactNumber,
        totalAmount
      }));
      localStorage.setItem("deliveryLocation", JSON.stringify(location));

      setPaymentInfo({ method: paymentMethod, bankType, mpesaNumber, paypalEmail, contactNumber, totalAmount });
      setDeliveryInfo(location);
      toast.success('Purchase completed successfully!');
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
{/** 
          <label><input type="radio" value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} /> Bank Payment</label>
          {paymentMethod === "bank" && (
            <div className="sub-option">
              <label>
                Bank Type:
                <select value={bankType} onChange={(e) => setBankType(e.target.value)}>
                  <option value="">--Select--</option>
                  <option value="bank-card">Bank Card</option>
                  <option value="credit-card">Credit Card</option>
                </select>
              </label>
              {bankType && (
                <div className="card-inputs">
                  <input type="text" placeholder="Card Number" maxLength="19" />
                  <input type="text" placeholder="Cardholder Name" />
                  <div className="expiry-cvc">
                    <input type="text" placeholder="MM/YY" maxLength="5" />
                    <input type="text" placeholder="CVC" maxLength="3" />
                  </div>
                </div>
              )}
            </div>
          )}
*/}
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
                <input name={field} value={location[field]} onChange={handleLocationChange} />
                <label className="floatingLabel">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              </div>
            ))}
            <div className="inputContainer">
              <input name="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
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
        <button onClick={handleCompletePurchase}>Complete Purchase</button>
        <button onClick={handleTrackDelivery}>Track Delivery</button>
      </div>

      <ToastContainer />
    </div>
  );
}