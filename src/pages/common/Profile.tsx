// src/pages/common/Profile.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiBriefcase, FiStar, FiEdit, FiAward, FiCalendar } from 'react-icons/fi';

import { ROUTES } from '../../utils/constants';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchMyProjects, selectIsLoading, selectMyProjects } from '../../features/projects/projectsSlice';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // ✅ Sélecteurs Redux
  const { user } = useAppSelector((state) => state.auth);
  const myProjects = useAppSelector(selectMyProjects);
  const isLoadingProjects = useAppSelector(selectIsLoading);

  // ✅ Charger les projets de l'utilisateur au montage
  useEffect(() => {
    console.log('📋 Profile - Chargement des projets de l\'utilisateur...');
    dispatch(fetchMyProjects());
  }, [dispatch]);

  // Helper pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper pour le statut du projet
  const getProjectStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      published: 'Publié',
      unpublished: 'Non publié',
      completed: 'Terminé',
      in_progress: 'En cours',
      draft: 'Brouillon',
    };
    return statusLabels[status] || status;
  };

  const getProjectStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      unpublished: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-purple-100 text-purple-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  // Déterminer le type d'utilisateur
  const isWorker = user.account_type?.worker;
  const contactInfo = user.contact || {};
  const accountType = user.account_type || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Bannière */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {/* Informations principales */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${contactInfo.firstName} ${contactInfo.lastName}`} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-4xl font-bold">
                    {contactInfo.firstName?.[0] || 'U'}
                    {contactInfo.lastName?.[0] || ''}
                  </div>
                )}
              </div>
            </div>

            {/* Bouton Modifier */}
            <div className="pt-4 flex justify-end">
              <Link
                to={ROUTES.EDIT_PROFILE}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FiEdit />
                Modifier le profil
              </Link>
            </div>

            {/* Nom et informations */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {contactInfo.firstName} {contactInfo.lastName}
              </h1>
              
              {isWorker && accountType.worker && (
                <p className="text-lg text-gray-600 mt-1 capitalize">
                  {accountType.worker}
                </p>
              )}

              {/* Badge rôle */}
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isWorker ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isWorker ? '👷 Travailleur' : '👨‍💼 Ingénieur'}
                </span>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail className="text-blue-600" />
                <span>{contactInfo.email || user.email}</span>
              </div>
              {contactInfo.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone className="text-blue-600" />
                  <span>{contactInfo.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBriefcase className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoadingProjects ? '...' : myProjects.length}
                </p>
                <p className="text-sm text-gray-600">Projets</p>
              </div>
            </div>
          </div>

          {isWorker && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FiStar className="text-2xl text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountType.rating ? accountType.rating.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiAward className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {accountType.years_of_experience || 0}
                    </p>
                    <p className="text-sm text-gray-600">Années d'expérience</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!isWorker && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiCalendar className="text-2xl text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingProjects ? '...' : myProjects.length}
                  </p>
                  <p className="text-sm text-gray-600">Projets créés</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compétences (pour les travailleurs) */}
        {isWorker && accountType.specialties && accountType.specialties.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Spécialités</h2>
            <div className="flex flex-wrap gap-2">
              {accountType.specialties.map((specialty: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (pour les travailleurs) */}
        {isWorker && accountType.certifications && accountType.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {accountType.certifications.map((cert: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Présentation (pour les travailleurs) */}
        {isWorker && accountType.presentation && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {accountType.presentation}
            </p>
          </div>
        )}

        {/* Projets récents */}
        {myProjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projets récents</h2>
            <div className="space-y-4">
              {myProjects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/engineer/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {formatDate(project.created_at)}
                        </span>
                        {project.images && project.images.length > 0 && (
                          <span>{project.images.length} images</span>
                        )}
                        {project.files && project.files.length > 0 && (
                          <span>{project.files.length} fichiers</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      getProjectStatusClass(project.status)
                    }`}>
                      {getProjectStatusLabel(project.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {myProjects.length > 5 && (
              <div className="mt-4 text-center">
                <Link
                  to="/engineer/projects"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tous les projets ({myProjects.length})
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Message si pas de projets */}
        {!isLoadingProjects && myProjects.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 mt-6 border border-gray-200 text-center">
            <FiBriefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucun projet pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier projet
            </p>
            <Link
              to="/engineer/projects/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiBriefcase />
              Créer un projet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;