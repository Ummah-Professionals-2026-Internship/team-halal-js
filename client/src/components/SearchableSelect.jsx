import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({
  label,
  name,
  value,
  options,
  placeholder,
  onChange,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setSearch(newVal);
    setIsOpen(true);
    onChange({ target: { name, value: newVal } });
  };

  const handleSelect = (option) => {
    setSearch(option);
    setIsOpen(false);
    onChange({ target: { name, value: option } });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative mb-3 text-left" ref={containerRef}>
      {label && <label className="block mb-1">{label}</label>}
      <input
        type="text"
        name={name}
        value={search}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm bg-white outline-none focus:border-[#007CA6]"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              onMouseDown={() => handleSelect(opt)}
              className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
