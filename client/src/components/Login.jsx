import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
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
      // TODO: navigate('/dashboard') once the dashboard page is built
      navigate('/login');
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title={<>Ummah Professionals<br />Mentorship Service</>}>
        <form className="signup-form" onSubmit={handleLoginSubmit}>
          {error && <p className="form-error">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <button
            type="button"
            className="submit-btn"
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
