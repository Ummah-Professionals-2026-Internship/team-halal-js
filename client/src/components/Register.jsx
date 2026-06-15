import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';

const Register = () => {
  const navigate = useNavigate();

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <AuthLayout>
      <AuthCard title="Create an Account">
        <form className="signup-form" onSubmit={handleRegisterSubmit}>
          <input type="email" placeholder="Email" className="form-input" />
          <input type="password" placeholder="Password" className="form-input" />
          <input type="password" placeholder="Confirm Password" className="form-input" />
          <button type="submit" className="submit-btn">Create Account</button>
        </form>
      </AuthCard>

      {/* 3. Back Button */}
      <button className="back-btn" onClick={() => navigate('/login')}>Back</button>
    </AuthLayout>
  );
};

export default Register;
