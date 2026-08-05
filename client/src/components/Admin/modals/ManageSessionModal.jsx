import React, { useState } from 'react';
import { cancelSession, requestReschedule } from '../../../api-calls/sessions';

const ManageSessionModal = ({ session, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState('both');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const mentorName = `${session.mentor?.firstName ?? 'Unknown'} ${session.mentor?.lastName ?? ''}`.trim();
  const menteeName = `${session.mentee?.firstName ?? 'Unknown'} ${session.mentee?.lastName ?? ''}`.trim();
  const recipientOptions = [
    { value: 'both', label: 'Both' },
    { value: 'mentor', label: mentorName || 'Mentor' },
    { value: 'mentee', label: menteeName || 'Mentee' },
  ];
  const when = new Date(session.scheduledTime);
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const handleCancel = async () => {
    if (!window.confirm(`Cancel the session between ${mentorName} and ${menteeName}? Both will be notified.`)) return;
    setSubmitting(true);
    setError('');
    try {
      await cancelSession(session._id, reason);
      onDone();
    } catch (err) {
      setError(err.message || 'Failed to cancel session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReschedule = async () => {
    setSubmitting(true);
    setError('');
    try {
      await requestReschedule(session._id, reason, recipient);
      onDone();
    } catch (err) {
      setError(err.message || 'Failed to send reschedule request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Manage Session</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm">
          <p className="font-semibold text-[#00212C]">{mentorName} and {menteeName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{dateStr} at {timeStr}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Send Reschedule Request To</label>
          <div className="flex gap-2">
            {recipientOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRecipient(option.value)}
                className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  recipient === option.value
                    ? 'bg-[#007CA6] text-white border-[#007CA6]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reason <span className="font-normal text-slate-400">(optional, included in the reschedule request or cancellation note)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Scheduling conflict reported by the mentor..."
            className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
          />
        </div>

        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleRequestReschedule}
            disabled={submitting}
            className="bg-[#fdbb36] text-[#00212C] font-semibold py-2.5 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting
              ? 'Working...'
              : `Request Reschedule (${recipientOptions.find(o => o.value === recipient).label})`}
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="bg-red-50 text-red-700 border border-red-200 font-semibold py-2.5 rounded-lg text-sm w-full hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Working...' : 'Cancel Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSessionModal;
