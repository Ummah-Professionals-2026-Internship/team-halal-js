import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
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
      if(formData.role === 'mentor'){
        navigate('/mentor-info');
      } else {
        navigate('/mentee-info');
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
      <AuthCard title="Create an Account">
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
            placeholder="Email"
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
          <select
            name="role"
            className={inputClasses}
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="mentee">Mentee</option>
            <option value="mentor">Mentor</option>
          </select>
          <button 
            type="submit" 
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold text-center shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </AuthCard>
      <button 
        className="md:absolute md:bottom-10 md:left-[92px] w-[170px] h-[65px] bg-[#003F55] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#002d3e] flex items-center justify-center self-center md:self-auto mt-5 md:mt-0" 
        onClick={() => navigate('/login')}
      >
        Back
      </button>
    </AuthLayout>
  );
};

export default Register;
