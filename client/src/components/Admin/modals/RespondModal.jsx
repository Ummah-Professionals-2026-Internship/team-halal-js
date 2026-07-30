import React, { useState } from 'react';
import { respondToHelpRequest } from '../../../api-calls/helpRequests';

const RespondModal = ({ helpRequest, onClose, onSent }) => {
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const name = `${helpRequest.user?.firstName ?? 'Someone'} ${helpRequest.user?.lastName ?? ''}`.trim();

  const handleSend = async () => {
    if (!response.trim()) return;
    setSending(true);
    setError('');
    try {
      await respondToHelpRequest(helpRequest._id, response);
      onSent();
    } catch (err) {
      setError(err.message || 'Failed to send response.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Respond to Help Request</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            From {name || 'a user'} ({helpRequest.user?.role === 'mentor' ? 'Mentor' : 'Mentee'})
          </p>
          {helpRequest.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {helpRequest.topics.map(topic => (
                <span key={topic} className="bg-[#fdbb36]/15 text-[#00212C] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          )}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {helpRequest.message || <span className="text-slate-400">No additional message provided.</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            placeholder="Type your answer to this help request..."
            className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
          />
        </div>

        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        <button
          onClick={handleSend}
          disabled={sending || !response.trim()}
          className="bg-[#003F55] text-white font-semibold py-2.5 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {sending ? 'Sending...' : 'Send Response'}
        </button>
      </div>
    </div>
  );
};

export default RespondModal;
