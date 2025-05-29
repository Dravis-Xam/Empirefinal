import React, { useEffect, useState } from 'react';
import PhoneCard from '../../../cards/phoneCard/PhoneCard';

export default function DeviceGallery() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState({transform: "translateX(0)"});

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

  const movetoNext = () => {
    setStyle(prev => ({...prev, transform: "translateX(-20%)"}))
  }


  const movetoPrev = () => {
    setStyle(prev => ({...prev, transform: "translateX(-20%)"}))
  }

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
        <div style={style}>
          <button onClick={()=>movetoPrev()} className="prev-button">‹</button>
        {devices.map((device) => (
          <PhoneCard key={device._id} device={device} />
        ))}
        <button onClick={()=>movetoNext()} className="next-button">›</button>
        </div>
      )}
    </div>
  );
}