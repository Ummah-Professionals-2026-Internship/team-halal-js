import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';

const GoogleRegister = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('mentee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('tempToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setTempToken(token);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);

      if (role === 'mentor') {
        navigate('/mentor/profile-setup');
      } else {
        navigate('/mentee/profile-setup');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title={<>One Last Step</>}>
        <p className="w-full max-w-[385px] text-center text-[#656565] text-lg mx-auto -mt-3">
          How will you be using the platform?
        </p>
        <form
          className="flex flex-col items-center gap-5 w-full m-0 p-0 box-border"
          onSubmit={handleSubmit}
        >
          {error && (
            <p className="w-full max-w-[385px] text-base text-[#c0392b] text-center mx-auto p-0">
              {error}
            </p>
          )}

          {/* Role selection cards */}
          <div className="flex flex-col gap-3 w-full max-w-[385px]">
            <label
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                role === 'mentee'
                  ? 'border-[#007CA6] bg-[#e8f4f8]'
                  : 'border-[#CFC5B3] bg-white hover:border-[#007CA6]/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="mentee"
                checked={role === 'mentee'}
                onChange={() => setRole('mentee')}
                className="accent-[#007CA6] w-5 h-5"
              />
              <div>
                <p className="font-semibold text-[#1a1a1a] text-lg">I'm a Mentee</p>
                <p className="text-[#656565] text-sm">I'm looking for guidance and mentorship</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                role === 'mentor'
                  ? 'border-[#007CA6] bg-[#e8f4f8]'
                  : 'border-[#CFC5B3] bg-white hover:border-[#007CA6]/50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="mentor"
                checked={role === 'mentor'}
                onChange={() => setRole('mentor')}
                className="accent-[#007CA6] w-5 h-5"
              />
              <div>
                <p className="font-semibold text-[#1a1a1a] text-lg">I'm a Mentor</p>
                <p className="text-[#656565] text-sm">I want to guide and support others</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#656565] text-sm hover:text-[#007CA6] transition-colors underline"
          >
            Back to login
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default GoogleRegister;
