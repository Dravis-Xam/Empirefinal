import { FiUser, FiGift, FiClock, FiXCircle } from 'react-icons/fi';
import './coupon.css';

export const CouponCard = ({ coupon }) => {
  const { username, offer, expires } = coupon;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="coupon-card-dark">
      <div className="coupon-header">
        <span className="coupon-badge">COUPON</span>
        <span className="coupon-status">Use once only</span>
      </div>
      
      <div className="coupon-body">
        <div className="coupon-offer">
          <h3>{offer}</h3>
        </div>
        
        <div className="coupon-details">
          <div className="detail-row">
            <FiUser className="detail-icon" />
            <span>{username}</span>
          </div>
          
          <div className="detail-row">
            <FiClock className="detail-icon" />
            <span>Expires: {formatDate(expires)}</span>
          </div>
        </div>
      </div>
      
      <div className="coupon-footer">
        <button className="coupon-action-btn">
          <FiGift /> Redeem
        </button>
        <button className="coupon-action-btn">
          <FiXCircle /> Revoke
        </button>
      </div>
    </div>
  );
};