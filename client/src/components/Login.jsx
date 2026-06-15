import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <AuthLayout>
      <AuthCard title={<>Ummah Professionals<br />Mentorship Service</>}>
        <form className="signup-form" onSubmit={handleLoginSubmit}>
          <input type="email" placeholder="Email" className="form-input" />
          <input type="password" placeholder="Password" className="form-input" />
          <button type="submit" className="submit-btn">Log in</button>
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
