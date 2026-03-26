// src/components/auth/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { ROUTES } from '../../utils/constants';

interface AdminRouteProps {
  children: React.ReactNode;
  /**
   * Rôles autorisés pour cette route.
   * Par défaut : ["admin"] seulement.
   */
  allowedRoles?: string[];
}

const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  allowedRoles = ['admin'],
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    // Rediriger vers le dashboard approprié selon le rôle réel
    const fallback =
      userRole === 'user'
        ? ROUTES.WORKER_DASHBOARD
        : ROUTES.ENGINEER_DASHBOARD;
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;