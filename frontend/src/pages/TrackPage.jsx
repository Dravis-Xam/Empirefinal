import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TrackDeliveryPage.css';
import Header from './components/sections/header/Header';
import DirectoryNavigation from './components/sections/nav/directoryNav/DirectoryNavigation';
import axios from 'axios';

const TrackDeliveryPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t_ID } = state || {};

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const statusSteps = [
    'Order confirmed',
    'Payment pending',
    'Processing',
    'Shipping',
    'Delivered'
  ];

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buy/status/by-transaction/${t_ID}`);
      const statusMap = {
        'rejected': 'Order confirmed',
        'pending delivery': 'Payment pending',
        'dispatched': 'Processing',
        'in delivery': 'Shipping',
        'awaiting pickup': 'Shipping',
        'arrived at destination': 'Delivered',
        'complete': 'Delivered'
      };
      setStatus(statusMap[response.data.status] || 'Order confirmed');
    } catch (err) {
      console.error('Error fetching order status:', err);
      setStatus('Order confirmed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (t_ID) {
      fetchStatus();
    } else {
      setStatus('Order confirmed');
      setLoading(false);
    }
  }, [t_ID]);

  if (!t_ID) {
    navigate('/not-found');
    return null;
  }

  const currentStepIndex = statusSteps.indexOf(status);

  return (
    <div className="track-delivery-container">
      <Header />
      <DirectoryNavigation />
      <h1>Order #{t_ID.slice(0, 6)} - Delivery Status</h1>

      {loading ? (
        <p>Loading status...</p>
      ) : (
        <div className="progress-container">
          <h2>Progress</h2>
          <div className="progress-steps">
            {statusSteps.map((step, index) => (
              <div 
                key={index} 
                className={`progress-step ${index <= currentStepIndex ? 'active' : ''}`}
              >
                { (step.toLowerCase() === 'delivered') && localStorage.removeItem('delivery')}
                <div className="step-indicator">
                  {index <= currentStepIndex && (
                    <div className="step-indicator-inner" />
                  )}
                </div>
                <div className="step-label">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackDeliveryPage;