import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'

const SearchConteiner = () => {
    const [q, setQ] = useState('');
    const [r, setR] = useState([]);
    const [l, setL] = useState(false)

    const handleSearch = async () => {
        setL(true);
        const params = new URLSearchParams();
        if (!q.trim()) return;
        if (q) params.append('q', q);
      
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/devices/search?${params.toString()}`);
            const data = await res.json();
            setR(data);
            setL(false);
        } catch (err) {
            console.error("Search fetch failed", err);
        }
    }

    return (
        <>
            <div className='headers-search-cont'>
                <div className="input-cont">
                    <input type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className='search-input'
                    />
                    <label htmlFor="text" className='input-label'>Find the phone of your choice . . .</label>
                </div>
                <button onClick={handleSearch}><FaSearch /></button>
            </div>
            <div className="overlay">
                <div className='result-container'>
                    {l && <div className='loading'></div> }
                    {r.length === 0 && r.map(d => (<li key={d._id || d.build} onClick={()=>navigate('/details', {state: {d}})}>
                        <strong>{d.brand} {d.model}</strong> — Ksh. {d.price.toLocaleString()}
                    </li>))}
                </div>
            </div>
        </>
    );
}

export default SearchConteiner;
