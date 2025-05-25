import { useState, useEffect } from 'react';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('live');

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/customercare/orders/get-latest', {
          method: 'GET',
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
          },
          signal,
        });

        if (!res.ok) throw new Error('Live orders fetch failed');
        const data = await res.json();
        //console.log('Live orders:', data);
        setOrders(data);
        console.log(data);
        setSource('live');
        setError(null);
      } catch (err) {
        if (signal.aborted) return;
        console.warn('Live fetch failed, trying fallback...');

        try {
          const resFallback = await fetch('http://localhost:5000/api/customercare/orders/fallback', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            signal,
          });

          if (!resFallback.ok) throw new Error('Fallback also failed');
          const dataFallback = await resFallback.json();
          console.log('Fallback orders:', dataFallback);
          setOrders(cleanOrders(dataFallback));
          setSource('fallback');
          setError(null);
        } catch (fallbackErr) {
          if (signal.aborted) return;
          setError('Failed to fetch orders from both sources.');
        }
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 15000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return { orders, source, error };
};

export default useOrders;
