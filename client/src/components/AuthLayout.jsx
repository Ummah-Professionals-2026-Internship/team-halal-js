import React from 'react';
import Navbar from './Navbar';

const AuthLayout = ({ children }) => {
  return (
    <div className="signup-page">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
