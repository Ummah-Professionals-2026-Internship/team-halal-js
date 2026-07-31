import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import { login } from '../api-calls/auth';

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Handle redirect back from Google OAuth (existing users get a ?token= in the URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const dest = params.get('dest');
    const googleError = params.get('googleError');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/login');
      if (dest) {
        navigate(dest);
      } else {
        // Fallback: decode role from JWT and go to dashboard
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'mentor') {
            navigate('/mentor-dashboard');
          } else {
            fetch('/api/sessions/mentee', { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.json())
              .then(sessions => navigate(sessions.length > 0 ? '/mentee/sessions' : '/mentee-dashboard'))
              .catch(() => navigate('/mentee-dashboard'));
          }
        } catch {
          setError('Sign-in failed. Please try again.');
        }
      }
      return;
    }

    if (googleError) {
      const messages = {
        cancelled: 'Google sign-in was cancelled.',
        token: 'Google sign-in failed. Please try again.',
        profile: 'Could not retrieve your Google profile. Please try again.',
        server: 'A server error occurred. Please try again.',
      };
      setError(messages[googleError] || 'Google sign-in failed.');
      window.history.replaceState({}, '', '/login');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowGoogleModal(false);
    setLoading(true);

    try {
      const data = await login(email, password);

      localStorage.setItem('token', data.token);

      // Navigate to dashboard if user completed their profile, otherwise navigate to onboarding info
      let role = data.user.role;
      if (role === 'admin') {
        navigate('/admin-dashboard');
      }
      else if (data.user.hasCompletedProfile) {
        if (role === 'mentor') {
          navigate('/mentor-dashboard');

        }
        else {
          const token = localStorage.getItem('token');
          fetch('/api/sessions/mentee', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(sessions => navigate(sessions.length > 0 ? '/mentee/sessions' : '/mentee-dashboard'))
            .catch(() => navigate('/mentee-dashboard'));
        }
      }
      else {
        if (role === 'mentor') {
          navigate('/mentor/profile-setup');
        }
        else {
          navigate('/mentee/profile-setup');
        }

      }
    } catch (err) {
      if (err.isGoogleAccount) {
        setShowGoogleModal(true);
      } else {
        setError(err.message || 'Could not connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect to the server-side Google OAuth flow
  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:5000/api/auth/google/signin';
  };

  const inputClasses = "w-full max-w-[385px] h-[70px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-2xl font-normal text-[#656565] transition-all duration-200 block mx-auto hover:border-[#007CA6]/50 focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:shadow-[0_0_0_4px_rgba(0,124,166,0.10)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";

  const primaryButtonClasses = "w-full max-w-[385px] h-[69px] bg-gradient-to-b from-[#0089b8] to-[#00698d] hover:from-[#0092c4] hover:to-[#007096] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_1px_2px_rgba(0,49,63,0.25),0_10px_24px_-6px_rgba(0,124,166,0.45)] hover:shadow-[0_2px_4px_rgba(0,49,63,0.3),0_14px_30px_-6px_rgba(0,124,166,0.55)] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#007CA6]/35 block mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back">
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
            className={primaryButtonClasses}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <button
            type="button"
            className={primaryButtonClasses}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>

          {/* Divider */}
          <div className="flex items-center w-full max-w-[385px] gap-3 mx-auto">
            <div className="flex-1 h-px bg-[#CFC5B3]" />
            <span className="text-[#656565] text-sm font-medium select-none">or</span>
            <div className="flex-1 h-px bg-[#CFC5B3]" />
          </div>

          {/* Sign in with Google */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            className="w-full max-w-[385px] h-[69px] bg-white border border-[#CFC5B3] rounded-lg text-[#3c3c3c] text-[20px] font-semibold flex items-center justify-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-4px_rgba(0,0,0,0.12)] cursor-pointer transition-all duration-200 hover:bg-[#f7f3ee] hover:border-[#b0a899] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_12px_28px_-4px_rgba(0,0,0,0.16)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#007CA6]/35 mx-auto"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>
      </AuthCard>

      {/* Modal for Google Sign-In recommendation - Rendered at root layout level for perfect backdrop clipping */}
      {showGoogleModal && (
        <>
          <style>{`
            @keyframes softBackdrop {
              0% { opacity: 0; backdrop-filter: blur(0px); }
              100% { opacity: 1; backdrop-filter: blur(6px); }
            }
            @keyframes gentleFloatIn {
              0% {
                opacity: 0;
                transform: translateY(14px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999] p-4"
            style={{ animation: 'softBackdrop 0.5s ease-out forwards' }}
          >
            <div
              className="bg-white rounded-[28px] p-7 max-w-md w-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] border border-slate-100 flex flex-col items-center text-center gap-5 relative overflow-hidden"
              style={{ animation: 'gentleFloatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold transition-colors cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                &times;
              </button>

              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center p-3 shadow-inner">
                <GoogleIcon />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-extrabold text-[#00212C]">Google Sign-In Required</h3>
                <p className="text-sm text-slate-600 leading-relaxed px-2">
                  The account associated with <span className="font-bold text-[#003F55]">{email}</span> was created using Google Sign-In and does not have a separate password.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 mt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-13 bg-white border border-[#CFC5B3] rounded-xl text-[#3c3c3c] text-base font-bold flex items-center justify-center gap-3 shadow-sm hover:bg-[#f7f3ee] hover:border-[#b0a899] transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
                >
                  <GoogleIcon />
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="w-full py-2 text-xs text-slate-400 font-semibold hover:text-slate-600 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default Login;
