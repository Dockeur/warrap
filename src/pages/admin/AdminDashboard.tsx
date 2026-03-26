// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { ROUTES } from '../../utils/constants';
import { 
  Users, 
  FolderKanban, 
  BarChart3, 
  Shield,
  Activity
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const dashboardCards = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les rôles et permissions des utilisateurs',
      icon: Users,
      link: ROUTES.ADMIN_USER_MANAGEMENT,
      color: 'bg-blue-500',
    },
    {
      title: 'Projets',
      description: 'Voir et gérer tous les projets',
      icon: FolderKanban,
      link: ROUTES.ENGINEER_LIST_PROJECT,
      color: 'bg-green-500',
    },
    {
      title: 'Statistiques',
      description: 'Voir les statistiques de la plateforme',
      icon: BarChart3,
      link: '#',
      color: 'bg-purple-500',
    },
    {
      title: 'Activité',
      description: 'Voir l\'activité récente',
      icon: Activity,
      link: '#',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord administrateur
            </h1>
          </div>
          <p className="text-gray-600">
            Bienvenue {user?.contact?.firstName} {user?.contact?.lastName}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={index}
                to={card.link}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Statistiques rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Utilisateurs</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Projets actifs</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Candidatures</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">-</p>
              <p className="text-sm text-gray-600 mt-1">Projets terminés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;