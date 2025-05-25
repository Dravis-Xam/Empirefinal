import React, { useState, useEffect, useRef } from 'react';
import './ReusableDropdown.css';

export default function ReusableDropdown({
  data = [],
  value,
  onChange,
  getLabel = (item) => item,
  getKey = (item, index) => index, 
  placeholder = 'Select an option',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);

  const filteredData = data.filter((item) =>
    getLabel(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (item) => {
    onChange(item); 
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredData.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev === 0 ? filteredData.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(filteredData[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="dropdown-container"
      ref={containerRef}
      tabIndex="0"
      onKeyDown={handleKeyDown}
    >
      <div className="dropdown-header" onClick={toggleDropdown}>
        {value ? getLabel(value) : placeholder}
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            className="dropdown-search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(0);
            }}
            autoFocus
          />
          <div className="dropdown-options">
            {filteredData.length === 0 ? (
              <div className="dropdown-item no-results">No results found</div>
            ) : (
              filteredData.map((item, index) => (
                <div
                  key={getKey(item, index)}
                  className={`dropdown-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  {getLabel(item)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}