import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({
  label,
  name,
  value, // Can be String (single select) or Array (multi select)
  options,
  placeholder,
  onChange,
  required = false,
  isMulti = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Initialize search text for single-select mode
  useEffect(() => {
    if (!isMulti) {
      setSearch(value || '');
    }
  }, [value, isMulti]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setSearch(newVal);
    setIsOpen(true);
    if (!isMulti) {
      onChange({ target: { name, value: newVal } });
    }
  };

  const handleSelect = (option) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (!currentValues.includes(option)) {
        const updated = [...currentValues, option];
        onChange({ target: { name, value: updated } });
      }
      setSearch(''); // Clear search on select
    } else {
      setSearch(option);
      onChange({ target: { name, value: option } });
    }
    setIsOpen(false);
  };

  const handleRemove = (optionToRemove) => {
    const currentValues = Array.isArray(value) ? value : [];
    const updated = currentValues.filter((v) => v !== optionToRemove);
    onChange({ target: { name, value: updated } });
  };

  const handleBlur = () => {
    // delay to allow onMouseDown on option list
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const selectedValues = isMulti && Array.isArray(value) ? value : [];

  return (
    <div className="relative mb-3 text-left" ref={containerRef}>
      {label && <label className="block mb-1">{label}</label>}
      
      {/* Container holding tags and input */}
      <div className="border border-gray-300 rounded px-3 py-1.5 w-full bg-white flex flex-wrap gap-1.5 items-center focus-within:border-[#007CA6] transition-all">
        {/* Selected tags */}
        {isMulti && selectedValues.map((val) => (
          <span 
            key={val} 
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200"
          >
            {val}
            <button
              type="button"
              onClick={() => handleRemove(val)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-0.5 focus:outline-none"
            >
              &times;
            </button>
          </span>
        ))}
        
        {/* Search input field */}
        <input
          type="text"
          name={name}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={isMulti && selectedValues.length > 0 ? '' : placeholder}
          required={required && selectedValues.length === 0 && !search}
          className="flex-1 min-w-[120px] text-sm bg-transparent outline-none border-none p-0"
        />
      </div>

      {/* Options dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
          {filteredOptions.map((opt) => {
            const isAlreadySelected = isMulti && selectedValues.includes(opt);
            return (
              <div
                key={opt}
                onMouseDown={() => !isAlreadySelected && handleSelect(opt)}
                className={`px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                  isAlreadySelected 
                    ? 'bg-slate-50 text-slate-400 cursor-default' 
                    : 'hover:bg-gray-100 text-slate-800'
                }`}
              >
                {opt} {isAlreadySelected && '(selected)'}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
