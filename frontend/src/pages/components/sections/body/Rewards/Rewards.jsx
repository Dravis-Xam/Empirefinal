import React, { useEffect, useState } from 'react';
import DiscountCard from '../../../cards/DiscountCard/DiscountCard';
// import CouponCard from '../../../cards/CouponCard/CouponCard';
import './Rewards.css';
import { useAuth } from '../../../../../modules/Store/AuthContext';

export default function Rewards() {
  // Coupon-related state and hooks (commented out)
  // const [coupons, setCoupons] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.username) return;

    // Coupon-fetching logic (commented out)
    /*
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/coupons/get-coupons/${user.username}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        const coupons = Array.isArray(data.coupons) ? data.coupons : data;

        const mapped = coupons.map((c) => {
          const percentMatch = c.offer.match(/(\d+)%/);
          const discount = percentMatch ? parseInt(percentMatch[1]) : 10;

          const expiryDate = new Date(c.expires);
          const now = new Date();
          const msLeft = expiryDate - now;

          const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
          const expiry =
            hoursLeft >= 24
              ? { period: Math.ceil(hoursLeft / 24), length: 'day' }
              : { period: hoursLeft, length: 'hour' };

          return {
            type: c.offer,
            details: {
              discount,
              usage: 'Single',
              expiry
            },
            couponId: `coupon-${c._id}`
          };
        });

        setCoupons(mapped);
      } catch (e) {
        console.error('Error fetching coupons:', e);
      }
    };

    fetchCoupons();
    */
  }, [user?.username]);

  return (
    <div className="RewardsContainer">
      <h1>Rewards</h1>
      <div className="RewardCardsContainer">
        <DiscountCard />
        {/* Coupon display UI (commented out)
        <div className="CouponContainer">
          <h2>Coupons</h2>
          {coupons.length === 0 ? (
            <p>No coupons available</p>
          ) : (
            coupons.map((coupon, i) => <CouponCard key={i} {...coupon} />)
          )}
        </div>
        */}
      </div>
    </div>
  );
}
