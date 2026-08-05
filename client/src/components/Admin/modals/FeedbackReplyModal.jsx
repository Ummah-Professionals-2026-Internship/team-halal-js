import React from 'react';

const FeedbackReplyModal = ({ notification, onClose, onDismiss }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-[#00212C]">Reply to Follow-Up</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
        {notification.message}
      </div>

      <button
        onClick={onDismiss}
        className="bg-[#003F55] text-white font-semibold py-2.5 rounded-lg text-sm w-full hover:bg-[#00212C] transition cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  </div>
);

export default FeedbackReplyModal;
