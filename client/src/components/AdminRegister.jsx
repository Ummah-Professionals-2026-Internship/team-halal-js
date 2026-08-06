import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import { register } from '../api-calls/auth';

const ADMIN_EMAIL_DOMAIN = '@ummahprofessionals.com';

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address with a domain extension of at least 2 characters (e.g. .com, .org, .co).');
      return;
    }

    if (!formData.email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN)) {
      setError(`Admin accounts require a ${ADMIN_EMAIL_DOMAIN} email address.`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        'admin'
      );

      localStorage.setItem('token', data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full max-w-[385px] h-[70px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-2xl font-normal text-[#656565] transition-all duration-200 block mx-auto focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80";

  return (
    <AuthLayout>
      <AuthCard title="Create an Admin Account">
        <form className="flex flex-col items-center gap-5 w-full m-0 p-0 box-border" onSubmit={handleRegisterSubmit}>
          {error && <p className="w-full max-w-[385px] text-base text-[#c0392b] text-center mx-auto p-0">{error}</p>}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className={inputClasses}
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className={inputClasses}
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder={`Email (${ADMIN_EMAIL_DOMAIN})`}
            className={inputClasses}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={inputClasses}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className={inputClasses}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
      </AuthCard>
      <button
        className="w-[170px] h-[56px] bg-[#003F55] border border-[#036383] rounded-lg text-[#F5F5F5] text-lg font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002d3e] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#007CA6]/35 flex items-center justify-center shadow-[0_4px_12px_rgba(0,49,63,0.25)]"
        onClick={() => navigate('/login')}
      >
        Back
      </button>
    </AuthLayout>
  );
};

export default AdminRegister;
