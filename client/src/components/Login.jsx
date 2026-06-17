import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';

const Login = () => {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);

      // Navigate to dashboard if user completed their profile, otherwise navigate to onboarding info
      let role = data.user.role;
      if (data.user.hasCompletedProfile) {
        if (role === 'mentor') {
          navigate('/mentor-dashboard');

        }
        else {
          navigate('/mentee-dashboard');
        }
      }
      else {
        if (role === 'mentor') {
          navigate('/mentor-info');
        }
        else {
          navigate('/mentee-info');
        }

      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full max-w-[385px] h-[70px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-2xl font-normal text-[#656565] transition-all duration-200 block mx-auto focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";

  return (
    <AuthLayout>
      <AuthCard title={<>Ummah Professionals<br />Mentorship Service</>}>
        <form className="flex flex-col items-center gap-5 w-full m-0 p-0 box-border" onSubmit={handleLoginSubmit}>
          {error && <p className="w-full max-w-[385px] text-base text-[#c0392b] text-center mx-auto p-0">{error}</p>}
          <input
            type="email"
            placeholder="Email"
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
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <button
            type="button"
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
