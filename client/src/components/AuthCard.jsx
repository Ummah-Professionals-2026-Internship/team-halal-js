import React from 'react';

const AuthCard = ({ title, children }) => {
  return (
    <div className="signup-card">
      <h2 className="card-title">{title}</h2>
      {children}
    </div>
  );
};

export default AuthCard;
