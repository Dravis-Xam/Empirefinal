import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import './CouponCard.css';

export default function CouponCard({
  type,
  details = {
    discount: 24,
    usage: 'Single',
    expiry: { period: 1, length: 'day' }
  },
  couponId
}) {
  const { discount, usage, expiry } = details;

  const [used, setUsed] = useState(() => {
    const saved = localStorage.getItem(`coupon-${couponId}-used`);
    return saved === 'true';
  });

  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiry.period);
  const [unit, setUnit] = useState(expiry.length);

  useEffect(() => {
    let expiryMs;
    if (expiry.length === 'day') {
      expiryMs = expiry.period * 24 * 60 * 60 * 1000;
    } else if (expiry.length === 'hour') {
      expiryMs = expiry.period * 60 * 60 * 1000;
    } else {
      console.warn("Unsupported expiry length:", expiry.length);
      return;
    }

    const expiryTimer = setTimeout(() => {
      setExpired(true);
    }, expiryMs);

    let interval;
    if (expiry.length === 'day') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 1) return prev - 1;
          else {
            clearInterval(interval);
            setUnit('hour');
            setTimeLeft(24);
            return 24;
          }
        });
      }, 24 * 60 * 60 * 1000);
    } else {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 1) return prev - 1;
          else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 60 * 60 * 1000);
    }

    return () => {
      clearTimeout(expiryTimer);
      clearInterval(interval);
    };
  }, [expiry.period, expiry.length]);

  const handleUseCoupon = () => {
    if (!used && !expired) {
      setUsed(true);
      localStorage.setItem(`coupon-${couponId}-used`, 'true');
    }
  };

  return (
    <div className="couponCard" aria-disabled={used || expired}>
      <h1><span>{discount}% off Coupon</span></h1>
      <div>
        <small>
          Expires in {timeLeft} {unit}{timeLeft !== 1 ? 's' : ''}
        </small>
        {' • '}
        <small>{usage} use only</small>
      </div>
      <p>Use this coupon in any purchase and save up to {discount}%</p>
      <button
        className="useCouponBtn"
        onClick={handleUseCoupon}
        disabled={expired || used}
      >
        {expired ? 'Expired' : (used ? 'Used' : 'Use')}
      </button>
    </div>
  );
}

CouponCard.propTypes = {
  type: PropTypes.string,
  couponId: PropTypes.string.isRequired,
  details: PropTypes.shape({
    discount: PropTypes.number.isRequired,
    expiry: PropTypes.shape({
      period: PropTypes.number.isRequired,
      length: PropTypes.oneOf(['day', 'hour']).isRequired
    }),
    usage: PropTypes.string.isRequired
  })
};