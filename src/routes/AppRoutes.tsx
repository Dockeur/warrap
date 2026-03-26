// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAppSelector } from '../store/store';
import { ROUTES } from '../utils/constants';
import AuthLayout from '../components/layout/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import MainLayout from '../components/layout/MainLayout';
import Profile from '../pages/common/Profile';
import EditProfile from '../pages/common/EditProfile';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import AvailabilityCalendar from '../pages/worker/AvailabilityCalendar';
import ProjectApplications from '../pages/worker/ProjectApplications';
import MyProjects from '../pages/worker/MyProjects';
import EngineerDashboard from '../pages/engineer/EngineerDashboard';
import WorkersList from '../pages/engineer/WorkersList';
import WorkerProfile from '../pages/engineer/WorkerProfile';
import CreateProject from '../pages/engineer/CreateProject';
import ProjectDetails from '../pages/engineer/ProjectDetails';
import EditProject from '../pages/engineer/EditProject';
import ManageApplications from '../pages/engineer/ManageApplications';
import RateWorker from '../pages/engineer/RateWorker';
import ProjectDetailsShared from '../pages/common/ProjectDetailsShared';
import ProjectsList from '../pages/engineer/ProjectsList';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import CommissionsManagement from '../pages/admin/CommissionsManagement';


import LandingPage from '../pages/public/LandingPage';
import Marketplace from '../pages/public/Marketplace';
import PublicProjectDetails from '../pages/public/PublicProjectDetails';
import JobsList from '../pages/admin/JobsList';
import JobDetail from '../pages/admin/JobDetail';


import CommercialDashboard from '../pages/commercial/CommercialDashboard';
import CommercialProjects from '../pages/commercial/CommercialProjects';
import MyCommissions from '../pages/commercial/MyCommissions';



const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const getUserDashboard = (): string => {
    if (!user) return ROUTES.LOGIN;

    switch (user.role) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD;

      case 'validator':
      case 'corrector':
      case 'manager':
        return ROUTES.ENGINEER_DASHBOARD;

      case 'commercial':
        return '/commercial/dashboard';

      case 'user':
     
      default:
        return ROUTES.WORKER_DASHBOARD;
    }
  };

  const userDashboard = getUserDashboard();

  return (
    <BrowserRouter>
      <Routes>
       

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={userDashboard} replace />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/project/:id" element={<PublicProjectDetails />} />

        

        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated ? (
              <Navigate to={userDashboard} replace />
            ) : (
              <AuthLayout>
                <Login />
              </AuthLayout>
            )
          }
        />

        <Route
          path={ROUTES.REGISTER}
          element={
            isAuthenticated ? (
              <Navigate to={userDashboard} replace />
            ) : (
              <AuthLayout>
                <Register />
              </AuthLayout>
            )
          }
        />

        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />

       

        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.EDIT_PROFILE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      

        <Route
          path="/commercial/dashboard"
          element={
            <ProtectedRoute allowedRoles={['commercial', 'admin']}>
              <MainLayout>
                <CommercialDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/commercial/projects"
          element={
            <ProtectedRoute allowedRoles={['commercial', 'admin']}>
              <MainLayout>
                <CommercialProjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/commercial/commissions"
          element={
            <ProtectedRoute allowedRoles={['commercial', 'admin']}>
              <MainLayout>
                <MyCommissions />
              </MainLayout>
            </ProtectedRoute>
          }
        />

     

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <AdminRoute allowedRoles={['admin']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_USER_MANAGEMENT}
          element={
            <AdminRoute allowedRoles={['admin']}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </AdminRoute>
          }
        />

       
        <Route
          path="/admin/commissions"
          element={
            <AdminRoute allowedRoles={['admin', 'corrector']}>
              <MainLayout>
                <CommissionsManagement />
              </MainLayout>
            </AdminRoute>
          }
        />

     

        <Route
          path={ROUTES.ADMIN_JOBS}
          element={
            <AdminRoute allowedRoles={['admin', 'validator', 'corrector', 'manager']}>
              <MainLayout>
                <JobsList />
              </MainLayout>
            </AdminRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DETAILJOBS}
          element={
            <AdminRoute allowedRoles={['admin', 'validator', 'corrector', 'manager']}>
              <MainLayout>
                <JobDetail />
              </MainLayout>
            </AdminRoute>
          }
        />

       

        <Route
          path={ROUTES.WORKER_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['user','engin']}>
              <MainLayout>
                <WorkerDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.WORKER_AVAILABILITY}
          element={
            <ProtectedRoute allowedRoles={['user', 'manager','engin']}>
              <MainLayout>
                <AvailabilityCalendar />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.WORKER_APPLICATIONS}
          element={
            <ProtectedRoute allowedRoles={['user','engin']}>
              <MainLayout>
                <ProjectApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.WORKER_PROJECTS}
          element={
            <ProtectedRoute allowedRoles={['user','engin']}>
              <MainLayout>
                <MyProjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      

        <Route
          path={ROUTES.ENGINEER_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <EngineerDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_WORKERS}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <WorkersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_WORKER_PROFILE}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <WorkerProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_CREATE_PROJECT}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'admin']}>
              <MainLayout>
                <CreateProject />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_LIST_PROJECT}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin']}>
              <MainLayout>
                <ProjectsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_PROJECT_DETAILS}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <ProjectDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_EDIT_PROJECT}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'admin']}>
              <MainLayout>
                <EditProject />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_MANAGE_APPLICATIONS}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <ManageApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ENGINEER_RATE_WORKER}
          element={
            <ProtectedRoute allowedRoles={['corrector', 'validator', 'admin', 'manager']}>
              <MainLayout>
                <RateWorker />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.PROJECT_DETAILS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetailsShared />
              </MainLayout>
            </ProtectedRoute>
          }
        />
 
      
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;