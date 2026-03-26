// src/components/layout/AuthLayout.tsx
import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen">{children}</div>;
};

export default AuthLayout;