// src/components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { ROUTES } from '../../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Liste des rôles autorisés. Si absent, tout utilisateur connecté est accepté.
   * Rôles disponibles : "user" | "corrector" | "validator" | "admin"
   */
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);



  // Non connecté → login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Vérification du rôle si spécifié
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      // Rediriger vers le dashboard approprié selon le rôle réel
      const fallback =
        userRole === 'admin'
          ? ROUTES.ADMIN_DASHBOARD
          : userRole === 'user'&&'engin'
          ? ROUTES.WORKER_DASHBOARD
          : ROUTES.ENGINEER_DASHBOARD;
      return <Navigate to={fallback} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;