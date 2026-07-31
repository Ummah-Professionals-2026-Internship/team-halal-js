import React, { useState } from 'react';

const AdminInviteModal = ({ onClose, onInvited }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send invitation.');
      }

      setSuccessMsg(`Invitation email successfully sent via Resend to ${email}!`);
      setTimeout(() => {
        if (onInvited) onInvited();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send invitation email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Invite New Administrator</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the email address of the person you want to invite. An automated invitation email containing a secure 48-hour registration link will be sent directly to their inbox via the Resend API.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. newadmin@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2.5 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}
          {successMsg && <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs font-medium">{successMsg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="flex-1 bg-[#0089b8] hover:bg-[#007096] text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
            >
              {sending ? 'Sending via Resend...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInviteModal;
