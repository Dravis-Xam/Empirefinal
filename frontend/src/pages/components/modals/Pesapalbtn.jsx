// PesapalPayButton.jsx
import React, { useState } from 'react';
import { toast } from '../../../modules/Store/ToastStore';

const PesapalPayButton = ({ name, email, phone, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://empirehubphones.onrender.com/api/buy/card`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, amount }),
      });

      const data = await res.json();
      console.log(data)
      if (data.iframe) {
        window.location.href = data.iframe;
      } else {
        toast.error('Payment link not available');
      }
    } catch (err) {
      toast.error('Error starting payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Pesapal'}
    </button>
  );
};

export default PesapalPayButton;
