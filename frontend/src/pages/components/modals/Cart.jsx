import './Cart.css';
import { useCart } from "../../../modules/Store/CartContext";
import { useNavigate } from "react-router-dom";
import DirectoryNavigation from "../sections/nav/directoryNav/DirectoryNavigation";
import Header from "../sections/header/Header";
import { toast } from "../../../modules/Store/ToastStore";
//import { useState } from 'react';

export default function Cart() {
  const { cart, addToCart, removeFromCart } = useCart();

  const groupedCart = cart.reduce((acc, item) => {
    const key = `${item.brand}-${item.build}-${item.model}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += 1;
    return acc;
  }, {});

  const cartItems = Object.values(groupedCart);
  const navigate = useNavigate();

  const handleAdd = (item) => addToCart(item);
  const handleRemove = (item) => removeFromCart(item);

const handleProceedToPay = async () => {
  try {
    // if (!username) {
    //   toast.error('Please provide a username');
    //   return;
    // }

    // const couponRes = await fetch(
    //   `http://localhost:5000/api/coupons/get-coupon/${username}`,
    //   {
    //     credentials: 'include',
    //     headers: { 'Content-Type': 'application/json' }
    //   }
    // );

    // if (!couponRes.ok) {
    //   toast.info('No coupon available');
    // } else {
    //   const couponData = await couponRes.json();

    //   if (couponData?.offer?.toLowerCase().includes('delivery') && !couponData?.used) {
    //     try {
    //       const updateRes = await fetch(
    //         `http://localhost:5000/api/coupons/update-coupon/${username}/${couponData?.couponId}`,
    //         {
    //           method: 'PUT',
    //           credentials: 'include',
    //           headers: { 'Content-Type': 'application/json' },
    //           body: JSON.stringify({ 
    //             used: true
    //           })
    //         }
    //       );

    //       if (!updateRes.ok) {
    //         throw new Error('Failed to update coupon');
    //       }

    //       shippingcost = 0;
    //       toast.success('Free delivery applied!');
    //     } catch (updateError) {
    //       console.error('Coupon update failed:', updateError);
    //       toast.error('Failed to apply coupon');
    //     }
    //   }
    // }
  } catch (e) {
    console.error('Proceed to pay error:', e);
    toast.error('An error occurred while processing your request');
  } finally {
    navigate('/checkout');
  }
};
  
let shippingcost = cart.length === 0 ? null : 500.0;

  return (
    <div><Header />
    <DirectoryNavigation />
    <div className="cart-container">
      <h1>Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-items">
          {cartItems.map((item, index) => (
            <li key={index} className="cart-item">
              <img src={item.image} alt={`${item.brand} ${item.model}`} className="item-image" />
              
              <div className="item-info">
                <h3>{item.brand} {item.model}</h3>
                <p><strong>Build:</strong> {item.build}</p>
                <p><strong>Price:</strong> Ksh. {item.price}</p>
                <p className={item.amountInStock <= item.quantity ? 'in-stock' : 'out-of-stock'}>
                  {item.availability}
                </p>
                <p><strong>Quantity:</strong> {item.quantity}</p>

                <p><strong>Delivery: </strong>Ksh. {shippingcost ?? shippingcost}</p>
              </div>

              <div className="item-actions">
                <button onClick={() => handleAdd(item)}>+</button>
                <button onClick={() => handleRemove(item)}>-</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-summary">
       <h2>
        Total: Ksh. { (cart.reduce((total, item) => total + item.price, 0) + (shippingcost || 0)).toFixed(2) }
      </h2>
      </div>
      <button className="proceed-to-pay-btn" onClick={handleProceedToPay} disabled={cartItems.length === 0}>
                Proceed to Pay
        </button>
    </div></div>
  );
}