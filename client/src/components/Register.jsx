import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import { register } from '../api-calls/auth';

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address with a domain extension of at least 2 characters (e.g. .com, .org, .co).');
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
        formData.role
      );

      localStorage.setItem('token', data.token);
      if(formData.role === 'mentor'){
        navigate('/mentor/profile-setup');
      } else {
        navigate('/mentee/profile-setup');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full h-12 px-4 bg-white border border-[#CFC5B3] rounded-lg text-base font-normal text-slate-800 transition-all duration-200 focus:border-[#007CA6] focus:ring-2 focus:ring-[#007CA6]/20 focus:outline-none placeholder:text-slate-400";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1 text-left w-full";

  return (
    <AuthLayout>
      <AuthCard title="Create an Account">
        <form className="flex flex-col gap-4 w-full m-0 p-0 box-border" onSubmit={handleRegisterSubmit}>
          {error && <p className="w-full text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded-lg p-3 text-center">{error}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className={labelClasses}>
                First Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Jane"
                className={inputClasses}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>
                Last Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                className={inputClasses}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              Email Address <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="jane.doe@example.com"
              className={inputClasses}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className={labelClasses}>
                Password <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="At least 8 chars..."
                className={inputClasses}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>
                Confirm Password <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                className={inputClasses}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              I want to join as a <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              name="role"
              className={inputClasses}
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="mentee">Mentee (Seeking Guidance)</option>
              <option value="mentor">Mentor (Offering Guidance)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full h-13 mt-2 bg-[#007CA6] border border-[#036383] rounded-xl text-white text-lg font-bold text-center shadow-md cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </AuthCard>
      <button
        className="w-[170px] h-12 bg-[#003F55] border border-[#036383] rounded-xl text-white text-base font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#002d3e] active:translate-y-0 active:scale-[0.98] flex items-center justify-center shadow-md"
        onClick={() => navigate('/login')}
      >
        Back
      </button>
    </AuthLayout>
  );
};

export default Register;
