import React, { useState, useEffect } from "react";
import './SearchPage.css';
import { useLocation, useNavigate } from "react-router-dom";
import TopSearchCard from "./components/cards/topSearchCard/TSCard";
import Header from './components/sections/header/Header';
import DirectoryNavigation from './components/sections/nav/directoryNav/DirectoryNavigation';
import MoveToTop from "./components/buttons/movetotop/MoveToTop";

export default function SearchPage() {
    const {state} = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState(state || '');
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [searchResults, setSearchResults] = useState([]);
    const [filters, setFilters] = useState({
        brand: '',
        minPrice: '',
        maxPrice: '',
        ram: ''
    });      

    const phonesTopSearchList = [
        'Samsung s24 Ultra', 'Poco x6', 'Infinix Hot 40 i', 'Iphone 14 pro', 'Ipad mini', 'Redmi', 'Nubia Red Magic'
    ];

    const handleBackNavigate = () => {
        navigate('/');
    };

    const removeRecentSearch = (item) => {
        const updated = recentSearches.filter(i => i !== item);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };
      
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };      

    const updateRecentSearches = (newQuery) => {
        const updated = [newQuery, ...recentSearches.filter(item => item !== newQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const fetchSearchResults = async (q) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.ram) params.append('ram', filters.ram);
      
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/devices/search?${params.toString()}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error("Search fetch failed", err);
        }
    };
      
    const findQuery = async (input = query) => {
        if (!input.trim()) return;

        setQuery(input);
        setSearching(true);
        updateRecentSearches(input);
        await fetchSearchResults(input);
    };

    const handleInputChange = (e) => {
        const input = e.target.value;
        setQuery(input);

        const allSuggestions = [...new Set([...recentSearches, ...phonesTopSearchList])];
        const filtered = input
            ? allSuggestions.filter(item =>
                item.toLowerCase().includes(input.toLowerCase())
              )
            : [];
        setSuggestions(filtered);
    };

    const handleSuggestionClick = (item) => {
        findQuery(item);
        setSuggestions([]);
    };

    return (
        <div className="searchPage">
            <Header />
            <DirectoryNavigation />

            <h1>Find the device which suits your best interest here</h1>

            <div className="ct000">
                <div className="inputContainer">
                    <input
                        type="text"
                        name="query"
                        value={query}
                        onChange={handleInputChange}
                        placeholder=" "
                        onFocus={() => query && setSuggestions(
                            [...new Set([...recentSearches, ...phonesTopSearchList])].filter(item =>
                                item.toLowerCase().includes(query.toLowerCase())
                            )
                        )}
                    />
                    <label className="floatingLabel">Search some phone ... </label>
                    {suggestions.length > 0 && (
                        <ul className="suggestionsList">
                            {suggestions.map(item => (
                                <li key={item} onClick={() => handleSuggestionClick(item)}>
                                    {highlightMatch(item, query)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="filtersContainer">
                    <div className="inputContainer">
                        <select 
                            style={{margin: 0}}
                            value={filters.brand} 
                            onChange={(e) => setFilters(f => ({ ...f, brand: e.target.value }))}
                        >
                            <option value="">All Brands</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Apple">Apple</option>
                            <option value="Infinix">Infinix</option>
                            <option value="Xiaomi">Xiaomi</option>
                        </select>
                    </div>
                    
                    <div className="inputContainer">
                        <select 
                            style={{margin: 0}}
                            value={filters.ram} 
                            onChange={(e) => setFilters(f => ({ ...f, ram: e.target.value }))}
                        >
                            <option value="">Any RAM</option>
                            <option value="4">4 GB</option>
                            <option value="6">6 GB</option>
                            <option value="8">8 GB</option>
                            <option value="12">12 GB</option>
                        </select>
                    </div>
                </div>

                <button className="searchBtn" onClick={() => findQuery()}>
                    Search
                </button>
            </div>

            {searching ? (
                <div className="resultsContainer">
                    <h3>Results for: <em>{query}</em></h3>
                    {searchResults.length === 0 ? (
                        <p>No results found.</p>
                    ) : (
                        <ul>
                            {searchResults.map((device) => (
                                <li key={device._id || device.build} onClick={()=> navigate('/details', {state: {device}})}>
                                    <strong>{device.brand} {device.model}</strong> — Ksh. {device.price.toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <>
                    {recentSearches.length > 0 && (
                        <div className="recentSearchesContainer">
                            <div className="recentHeader">
                                <h3>Your Recent Searches</h3>
                                <button className="clearAllBtn" onClick={clearRecentSearches}>
                                    Clear All
                                </button>
                            </div>
                            <div className="recentTags">
                                {recentSearches.map(item => (
                                    <div key={item} className="recentTagItem">
                                        <button 
                                            onClick={() => handleSuggestionClick(item)} 
                                            className="recentTag"
                                        >
                                            {item}
                                        </button>
                                        <span 
                                            className="removeTag" 
                                            onClick={() => removeRecentSearch(item)}
                                        >
                                            ✕
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="topSearchesContainer">
                        <h3>Top searches</h3>
                        <div>
                            {phonesTopSearchList.map((i) => (
                                <TopSearchCard 
                                    key={i} 
                                    t={i} 
                                    onClick={() => handleSuggestionClick(i)} 
                                />
                            ))}
                        </div>
                    </div>
                    <MoveToTop />
                </>
            )}
        </div>
    );
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;

    return (
        <>
            {text.substring(0, idx)}
            <strong>{text.substring(idx, idx + query.length)}</strong>
            {text.substring(idx + query.length)}
        </>
    );
}