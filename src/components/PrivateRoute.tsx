import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Vérifie la présence du token JWT dans le localStorage
  const token = localStorage.getItem('token');

  // Si le token n'existe pas, redirection vers la page de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si authentifié, permet l'accès aux routes enfants (Outlet)
  return <Outlet />;
};

export default PrivateRoute;
