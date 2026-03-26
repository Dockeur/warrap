// src/pages/auth/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { clearError, login } from '../../features/auth/authSlice';
import { ROUTES } from '../../utils/constants';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const hasRedirected = useRef(false);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;

      console.log('👤 Utilisateur connecté:', user);

      const role       = user.role?.toLowerCase();
      const workerType = user.account_type?.worker?.toLowerCase();

      console.log('🔍 Rôle:', role, '| Worker type:', workerType);

      let dashboardRoute: string;

      switch (role) {
        case 'admin':
          dashboardRoute = ROUTES.ADMIN_DASHBOARD;
          console.log('✅ Admin détecté');
          break;

        case 'commercial':
          dashboardRoute = '/commercial/dashboard';
          console.log('✅ Commercial détecté');
          break;

        case 'validator':
        case 'corrector':
        case 'manager':
          dashboardRoute = ROUTES.ENGINEER_DASHBOARD;
          console.log('✅ Engineer/Validator/Corrector détecté');
          break;

        case 'user':
        default:
          // Pour le rôle "user", on distingue par le type de worker
          if (workerType === 'technicien') {
            dashboardRoute = ROUTES.WORKER_DASHBOARD;
            console.log('✅ Technicien détecté');
          } else {
            dashboardRoute = ROUTES.ENGINEER_DASHBOARD;
            console.log('✅ Worker autre détecté');
          }
          break;
      }

      console.log('🚀 Redirection vers:', dashboardRoute);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hasRedirected.current = false;
    console.log('📤 Tentative de connexion avec:', formData.email);
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et Titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">WP</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword
                    ? <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    : <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mot de passe oublié */}
          <div className="flex items-center justify-end">
            <Link to={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          {/* Inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link to={ROUTES.REGISTER}
                className="font-medium text-blue-600 hover:text-blue-500">
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;