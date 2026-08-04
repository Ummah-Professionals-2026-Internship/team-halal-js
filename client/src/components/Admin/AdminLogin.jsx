import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../AuthLayout';
import AuthCard from '../AuthCard';
import { login } from '../../api-calls/auth';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.user.role !== 'admin') {
        setError('Access denied. This portal is for Administrators only.');
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full max-w-[385px] h-[65px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-xl font-normal text-[#656565] transition-all duration-200 block mx-auto hover:border-[#007CA6]/50 focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";
  const primaryButtonClasses = "w-full max-w-[385px] h-[65px] bg-gradient-to-b from-[#0089b8] to-[#00698d] hover:from-[#0092c4] hover:to-[#007096] border border-[#036383] rounded-lg text-[#F5F5F5] text-[22px] font-bold text-center shadow-[0_1px_2px_rgba(0,49,63,0.25),0_10px_24px_-6px_rgba(0,124,166,0.45)] hover:shadow-[0_2px_4px_rgba(0,49,63,0.3),0_14px_30px_-6px_rgba(0,124,166,0.55)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <AuthLayout>
      <AuthCard title="Admin Portal Login">
        <form className="flex flex-col items-center gap-4 w-full m-0 p-0 box-border" onSubmit={handleLoginSubmit}>
          <p className="text-[#656565] text-sm text-center max-w-[385px] -mt-4 mb-2">
            Secure portal access for Ummah Professionals Administrators.
          </p>

          {error && (
            <div className="w-full max-w-[385px] p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Admin Email"
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
          <button
            type="submit"
            className={primaryButtonClasses}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Admin Sign In'}
          </button>

          <div className="mt-4 text-center text-sm text-[#656565]">
            Need to set up the primary admin?{' '}
            <Link to="/admin/setup" className="text-[#0089b8] font-bold hover:underline">
              Initial Admin Setup
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default AdminLogin;
