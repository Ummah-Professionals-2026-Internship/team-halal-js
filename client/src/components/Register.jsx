import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/login');
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Create an Account">
        <form className="signup-form" onSubmit={handleRegisterSubmit}>
          {error && <p className="form-error">{error}</p>}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            className="form-input form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="mentee">Mentee</option>
            <option value="mentor">Mentor</option>
          </select>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </AuthCard>
      <button className="back-btn" onClick={() => navigate('/login')}>Back</button>
    </AuthLayout>
  );
};

export default Register;
