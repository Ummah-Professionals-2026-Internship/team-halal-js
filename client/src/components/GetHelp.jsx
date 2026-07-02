import React, { useState } from 'react';

const GetHelp = ({ onClose }) => {
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const options = ['Technical Issues with the platform', 'Questions about the service', 'Other'];

  const toggleOption = (option) => {
    setSelected(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-[#C5DCE8] rounded-2xl p-8 w-full max-w-md flex flex-col items-center gap-4 text-center">
          <p className="text-[#00212C] font-medium">
            Help requested. Thank you for contacting Ummah Professionals, the team will respond shortly.
          </p>
          <button onClick={onClose} className="bg-[#003F55] text-white font-semibold px-6 py-2 rounded-lg text-sm">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#C5DCE8] rounded-2xl p-8 w-full max-w-md relative flex flex-col gap-4">
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl font-bold text-[#00212C]">✕</button>

        <p className="text-[#00212C] text-center font-medium">
          If you have any questions or issues that came up while using this service, you can contact Ummah Professionals here for a response.
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-[#00212C] font-semibold text-center">What do you need help with?</p>
          {options.map(option => (
            <label key={option} className="flex items-center gap-2 text-[#00212C] text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-4 h-4"
              />
              {option}
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[#00212C] text-sm text-center">Enter your questions/feedback here.</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg p-3 text-sm text-[#00212C] resize-none h-32 border border-gray-300 outline-none bg-white"
          />
        </div>

        <p className="text-[#00212C] text-sm text-center">
          The Ummah Professionals team will respond to you as soon as possible.
        </p>

        <button
          onClick={() => setSubmitted(true)}
          disabled={selected.length === 0 && message.trim() === ''}
          className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default GetHelp;
