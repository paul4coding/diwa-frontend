import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const roles = user?.roles || [];
  const isEmployee = roles.some((role: string) => 
    ['ROLE_ADMIN', 'ROLE_RECEPTIONNISTE', 'ROLE_CHEF_TECHNICIEN', 'ROLE_TECHNICIEN', 'ROLE_CHAUFFEUR', 'ROLE_STOCK', 'ROLE_DG'].includes(role)
  );

  if (!token || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
