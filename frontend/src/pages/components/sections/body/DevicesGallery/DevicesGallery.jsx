import React, { useEffect, useState } from 'react';
import PhoneCard from '../../../cards/phoneCard/PhoneCard';
import RhombusLoader from '../../../loading/RhombusLoading';

export default function DeviceGallery() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/devices/get`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch devices');
        }
        
        const data = await res.json();

        if (Array.isArray(data)) {
          setDevices(data);
        } else {
          setError('Invalid data format: expected an array of devices');
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        setError('Error fetching devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div className="phoneCardsContainer">
      {loading ? (
        <p>Loading devices...</p>
      ) : error ? (
        <>
          <p>Unable to load information on available phones </p>
          {console.log(error)}
        </>
      ) : devices.length === 0 ? (
        <p>No devices available.</p>
      ) : (
        devices.map((device) => (
          <PhoneCard key={device._id} device={device} />
        ))
      )}
    </div>
  );
}