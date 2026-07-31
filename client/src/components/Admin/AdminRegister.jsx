import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../AuthLayout';
import AuthCard from '../AuthCard';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token. Admin registration requires a valid invite link.');
    }
  }, [token]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Cannot complete registration without a valid invitation token.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, firstName, lastName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Admin registration failed.');
      }

      localStorage.setItem('token', data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Server error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full max-w-[385px] h-[60px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-xl font-normal text-[#656565] transition-all duration-200 block mx-auto hover:border-[#007CA6]/50 focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";
  const primaryButtonClasses = "w-full max-w-[385px] h-[65px] bg-gradient-to-b from-[#0089b8] to-[#00698d] hover:from-[#0092c4] hover:to-[#007096] border border-[#036383] rounded-lg text-[#F5F5F5] text-[22px] font-bold text-center shadow-[0_1px_2px_rgba(0,49,63,0.25),0_10px_24px_-6px_rgba(0,124,166,0.45)] hover:shadow-[0_2px_4px_rgba(0,49,63,0.3),0_14px_30px_-6px_rgba(0,124,166,0.55)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AuthLayout>
      <AuthCard title="Admin Invitation">
        <form className="flex flex-col items-center gap-4 w-full m-0 p-0 box-border" onSubmit={handleRegisterSubmit}>
          <p className="text-[#656565] text-sm text-center max-w-[385px] -mt-4 mb-2">
            Complete your administrator profile setup to activate your account.
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
              disabled={!token}
            />
            <input
              type="text"
              placeholder="Last Name"
              className={`${inputClasses} flex-1`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={!token}
            />
          </div>

          <input
            type="password"
            placeholder="Set Account Password"
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token}
          />

          <button
            type="submit"
            className={primaryButtonClasses}
            disabled={loading || !token}
          >
            {loading ? 'Activating Account...' : 'Complete Admin Registration'}
          </button>

          <div className="mt-2 text-center text-sm text-[#656565]">
            Already registered?{' '}
            <Link to="/admin/login" className="text-[#0089b8] font-bold hover:underline">
              Admin Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default AdminRegister;
