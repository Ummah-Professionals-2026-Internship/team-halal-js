import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({
  label,
  name,
  value, // Can be String (single select) or Array (multi select)
  options = [],
  categories = null, // Optional array of { category: string, roles: string[] }
  quickPills = null, // Optional array of strings for 1-click popular selections
  placeholder,
  onChange,
  required = false,
  isMulti = false,
  strictMatch = true,
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

  // Consolidate flat options from categories if provided
  let effectiveOptions = Array.isArray(options) && options.length > 0 ? options : [];
  if (categories && Array.isArray(categories)) {
    const fromCategories = categories.flatMap(cat => cat.roles || []);
    effectiveOptions = Array.from(new Set([...effectiveOptions, ...fromCategories]));
  }

  const filteredFlatOptions = effectiveOptions.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCategories = categories && Array.isArray(categories)
    ? categories
        .map(cat => ({
          ...cat,
          filteredRoles: (cat.roles || []).filter(r =>
            r.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(cat => cat.filteredRoles.length > 0)
    : null;

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setSearch(newVal);
    setIsOpen(true);
    if (!isMulti && !strictMatch) {
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
    setTimeout(() => {
      setIsOpen(false);
      if (!isMulti && strictMatch) {
        if (!search.trim()) {
          onChange({ target: { name, value: '' } });
          setSearch('');
          return;
        }
        const exact = effectiveOptions.find(
          (opt) => opt.toLowerCase() === search.trim().toLowerCase()
        );
        if (exact) {
          setSearch(exact);
          onChange({ target: { name, value: exact } });
        } else if (value && effectiveOptions.includes(value)) {
          setSearch(value);
        } else {
          setSearch('');
          onChange({ target: { name, value: '' } });
        }
      }
    }, 200);
  };

  const selectedValues = isMulti && Array.isArray(value) ? value : [];

  return (
    <div className="relative mb-4 text-left" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required ? (
            <span className="text-red-500 font-bold ml-1">*</span>
          ) : (
            <span className="text-slate-400 text-xs font-normal ml-1.5">(Optional)</span>
          )}
        </label>
      )}

      {/* Quick Pills (Top/Popular Suggestions) */}
      {quickPills && Array.isArray(quickPills) && quickPills.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <span>🔥 Popular Choices:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPills.map(pill => {
              const isSelected = isMulti
                ? selectedValues.includes(pill)
                : value === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleSelect(pill)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#007CA6] text-white border-[#007CA6] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#007CA6]/50 hover:bg-[#007CA6]/10'
                  }`}
                >
                  {isSelected ? `✓ ${pill}` : pill}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Container holding tags and input */}
      <div className="border border-slate-200 rounded-lg px-3 py-2 w-full bg-white flex flex-wrap gap-1.5 items-center focus-within:border-[#007CA6] focus-within:ring-2 focus-within:ring-[#007CA6]/20 transition-all">
        {/* Selected tags */}
        {isMulti && selectedValues.map((val) => (
          <span 
            key={val} 
            className="inline-flex items-center gap-1 bg-[#007CA6]/10 text-[#003F55] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#007CA6]/20"
          >
            {val}
            <button
              type="button"
              onClick={() => handleRemove(val)}
              className="text-[#007CA6] hover:text-red-600 font-bold ml-1 focus:outline-none"
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
          placeholder={isMulti && selectedValues.length > 0 ? 'Add another...' : placeholder}
          required={required && selectedValues.length === 0 && !value}
          className="flex-1 min-w-[140px] text-sm bg-transparent outline-none border-none p-0 text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-30 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg mt-1 shadow-xl">
          {filteredCategories ? (
            filteredCategories.map((group) => (
              <div key={group.category} className="border-b border-slate-100 last:border-b-0">
                <div className="bg-slate-50/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#003F55] sticky top-0 border-b border-slate-100">
                  {group.category}
                </div>
                {group.filteredRoles.map((role) => {
                  const isAlreadySelected = isMulti && selectedValues.includes(role);
                  return (
                    <div
                      key={role}
                      onMouseDown={() => !isAlreadySelected && handleSelect(role)}
                      className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                        isAlreadySelected 
                          ? 'bg-slate-50 text-slate-400 cursor-default' 
                          : 'hover:bg-[#007CA6]/10 hover:text-[#003F55] text-slate-700 font-medium'
                      }`}
                    >
                      {role} {isAlreadySelected && '(selected)'}
                    </div>
                  );
                })}
              </div>
            ))
          ) : filteredFlatOptions.length > 0 ? (
            filteredFlatOptions.map((opt) => {
              const isAlreadySelected = isMulti && selectedValues.includes(opt);
              return (
                <div
                  key={opt}
                  onMouseDown={() => !isAlreadySelected && handleSelect(opt)}
                  className={`px-3.5 py-2 cursor-pointer text-sm transition-colors ${
                    isAlreadySelected 
                      ? 'bg-slate-50 text-slate-400 cursor-default' 
                      : 'hover:bg-[#007CA6]/10 hover:text-[#003F55] text-slate-700 font-medium'
                  }`}
                >
                  {opt} {isAlreadySelected && '(selected)'}
                </div>
              );
            })
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 text-center font-medium">
              No matching options found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
