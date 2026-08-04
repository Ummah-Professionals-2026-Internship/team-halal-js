import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../AuthLayout';
import AuthCard from '../AuthCard';

const AdminSetup = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Setup failed. Check your secret key.');
      }

      localStorage.setItem('token', data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Server error during setup.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full max-w-[385px] h-[55px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-lg font-normal text-[#656565] transition-all duration-200 block mx-auto hover:border-[#007CA6]/50 focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";
  const primaryButtonClasses = "w-full max-w-[385px] h-[60px] bg-gradient-to-b from-[#0089b8] to-[#00698d] hover:from-[#0092c4] hover:to-[#007096] border border-[#036383] rounded-lg text-[#F5F5F5] text-[20px] font-bold text-center shadow-[0_1px_2px_rgba(0,49,63,0.25),0_10px_24px_-6px_rgba(0,124,166,0.45)] hover:shadow-[0_2px_4px_rgba(0,49,63,0.3),0_14px_30px_-6px_rgba(0,124,166,0.55)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AuthLayout>
      <AuthCard title="Initial Admin Setup">
        <form className="flex flex-col items-center gap-3 w-full m-0 p-0 box-border" onSubmit={handleSetupSubmit}>
          <p className="text-[#656565] text-sm text-center max-w-[385px] -mt-4 mb-1">
            Bootstrap the primary Administrator account using the system setup key.
          </p>

          {error && (
            <div className="w-full max-w-[385px] p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2 w-full max-w-[385px]">
            <input
              type="text"
              placeholder="First Name"
              className={`${inputClasses} flex-1`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className={`${inputClasses} flex-1`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Admin Email Address"
            className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Secret Key"
            className={`${inputClasses} border-[#0089b8] bg-blue-50/30`}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
          />

          <button
            type="submit"
            className={primaryButtonClasses}
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Create Admin Account'}
          </button>

          <div className="mt-2 text-center text-sm text-[#656565]">
            Already configured?{' '}
            <Link to="/admin/login" className="text-[#0089b8] font-bold hover:underline">
              Back to Admin Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default AdminSetup;
