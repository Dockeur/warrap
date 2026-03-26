// src/pages/engineer/ProjectsList.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiImage, FiFileText, FiCalendar, FiUser,
  FiEye, FiAlertCircle, FiShield, FiClock, FiCheckCircle, FiDollarSign,
} from 'react-icons/fi';
// import { toast } from 'react-toastify';
import { ROUTES, generateProjectUrl } from '../../utils/constants';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProjects, selectError, selectIsLoading, selectProjects } from '../../features/projects/projectsSlice';

// ─── TYPES & HELPERS ─────────────────────────────────────────────────────────

/**
 * Catégorisation des projets :
 *
 * 1. "non_accepte"  → status === 'unpublished'  (pas encore validé)
 * 2. "accepte"      → status !== 'unpublished'  ET amount nul / 0
 * 3. "prix_fixe"    → status !== 'unpublished'  ET amount > 0
 */
type ProjectCategory = 'non_accepte' | 'accepte' | 'prix_fixe';

const categorize = (project: any): ProjectCategory => {
  const isAccepted = project.status !== 'unpublished';
  const hasPrix    = project.amount && parseFloat(project.amount) > 0;
  if (!isAccepted) return 'non_accepte';
  if (hasPrix)     return 'prix_fixe';
  return 'accepte';
};

const SECTIONS: { key: ProjectCategory; label: string; sub: string; icon: React.ReactNode; color: string; border: string; badge: string }[] = [
  {
    key:    'non_accepte',
    label:  'En attente de validation',
    sub:    'Projets soumis, pas encore acceptés',
    icon:   <FiClock className="h-5 w-5 text-orange-600" />,
    color:  'bg-orange-50 border-orange-200',
    border: 'border-l-4 border-orange-400',
    badge:  'bg-orange-100 text-orange-800',
  },
  {
    key:    'accepte',
    label:  'Acceptés — prix non encore fixé',
    sub:    'Projets validés, montant en attente',
    icon:   <FiCheckCircle className="h-5 w-5 text-blue-600" />,
    color:  'bg-blue-50 border-blue-200',
    border: 'border-l-4 border-blue-400',
    badge:  'bg-blue-100 text-blue-800',
  },
  {
    key:    'prix_fixe',
    label:  'Prix fixé',
    sub:    'Projets acceptés avec montant défini',
    icon:   <FiDollarSign className="h-5 w-5 text-green-600" />,
    color:  'bg-green-50 border-green-200',
    border: 'border-l-4 border-green-400',
    badge:  'bg-green-100 text-green-800',
  },
];

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

const truncateText = (text: string, max: number) =>
  text.length <= max ? text : text.substring(0, max) + '…';

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    published:   { label: 'Publié',      className: 'bg-green-100 text-green-800'   },
    unpublished: { label: 'Non publié',  className: 'bg-gray-100 text-gray-800'     },
    completed:   { label: 'Terminé',     className: 'bg-blue-100 text-blue-800'     },
    in_progress: { label: 'En cours',    className: 'bg-yellow-100 text-yellow-800' },
  };
  return map[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
};

// ─── CARD ────────────────────────────────────────────────────────────────────

const ProjectCard: React.FC<{ project: any; isAdmin: boolean }> = ({ project, isAdmin }) => {
  const statusConfig = getStatusBadge(project.status);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200">
        {project.images?.length > 0 ? (
          <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiImage className="h-14 w-14 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 flex space-x-2">
          {project.images?.length > 0 && (
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FiImage className="h-3 w-3" />{project.images.length}
            </span>
          )}
          {project.files?.length > 0 && (
            <span className="bg-green-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <FiFileText className="h-3 w-3" />{project.files.length}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={project.name}>
          {project.name}
        </h3>
        <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono mb-3 inline-block">
          {project.uuid}
        </code>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
          {truncateText(project.description || '', 100)}
        </p>

        <div className="space-y-1.5 mb-4 pb-4 border-b border-gray-100 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {project.user?.contact?.firstName} {project.user?.contact?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>

        {/* Montant si fixé */}
        {project.amount && parseFloat(project.amount) > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-medium mb-0.5">Montant fixé</p>
            <p className="text-lg font-bold text-green-700">
              {parseFloat(project.amount).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        )}

        <Link
          to={generateProjectUrl(project.id)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
        >
          <FiEye className="h-4 w-4" />
          {isAdmin ? 'Consulter le projet' : 'Voir le projet'}
        </Link>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const ProjectsList: React.FC = () => {
  const dispatch   = useAppDispatch();
  const projects   = useAppSelector(selectProjects);
  const isLoading  = useAppSelector(selectIsLoading);
  const error      = useAppSelector(selectError);
  const { user }   = useAppSelector((state) => state.auth);

  // Admin ET validator voient tous les projets avec les 3 sections
  const isAdmin     = user?.role === 'admin';
  const isValidator = user?.role === 'validator';
  const isElevated  = isAdmin || isValidator; // mode "vue globale"

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Répartition en 3 catégories
  const grouped = {
    non_accepte: projects.filter(p => categorize(p) === 'non_accepte'),
    accepte:     projects.filter(p => categorize(p) === 'accepte'),
    prix_fixe:   projects.filter(p => categorize(p) === 'prix_fixe'),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">
                {isElevated ? 'Tous les Projets' : 'Mes Projets'}
                {projects.length > 0 && (
                  <span className="ml-3 text-blue-600">({projects.length})</span>
                )}
              </h1>
              {isAdmin && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <FiShield className="h-3 w-3 mr-1" />Mode Admin
                </span>
              )}
              {isValidator && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <FiShield className="h-3 w-3 mr-1" />Mode Validateur
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {isElevated
                ? 'Supervision et gestion des projets de la plateforme'
                : 'Gérez et partagez vos projets avec vos clients'}
            </p>
          </div>

          {/* Bouton nouveau projet — corrector uniquement */}
          {!isElevated && (
            <Link
              to={ROUTES.ENGINEER_CREATE_PROJECT}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <FiPlus className="h-5 w-5" />
              Nouveau Projet
            </Link>
          )}
        </div>

        {/* ── BANDEAU INFO ELEVATED ── */}
        {isElevated && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiShield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-medium">
                  {isAdmin ? 'Mode Administrateur' : 'Mode Validateur'}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Vous consultez l'ensemble des projets classés par état. Vous pouvez ajouter des observations et{' '}
                  {isAdmin ? 'gérer les montants.' : 'valider les projets.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── ERREUR ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FiAlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* ── CONTENU ── */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <FiFileText className="mx-auto h-20 w-20 text-gray-400 mb-4" />
            <h3 className="text-2xl font-medium text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isElevated
                ? "Aucun projet n'a encore été créé sur la plateforme"
                : 'Commencez par créer votre premier projet'}
            </p>
            {!isElevated && (
              <Link
                to={ROUTES.ENGINEER_CREATE_PROJECT}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <FiPlus className="h-5 w-5" />Créer un Projet
              </Link>
            )}
          </div>
        ) : isElevated ? (
          /* ── VUE ÉLEVÉE : 3 SECTIONS SÉPARÉES ── */
          <div className="space-y-10">
            {SECTIONS.map((section) => {
              const list = grouped[section.key];
              return (
                <div key={section.key}>
                  {/* Titre de section */}
                  <div className={`flex items-center gap-3 mb-4 p-4 rounded-xl border ${section.color}`}>
                    {section.icon}
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900">{section.label}</h2>
                      <p className="text-xs text-gray-500">{section.sub}</p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${section.badge}`}>
                      {list.length} projet{list.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <div className={`rounded-xl border ${section.color} p-8 text-center`}>
                      <p className="text-sm text-gray-500">Aucun projet dans cette catégorie</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((project) => (
                        <ProjectCard key={project.id} project={project} isAdmin={isElevated} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">{grouped.non_accepte.length}</p>
                  <p className="text-sm text-gray-600 mt-1">En attente</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-500">{grouped.accepte.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Acceptés</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">{grouped.prix_fixe.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Prix fixé</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── VUE CORRECTOR : grille simple ── */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} isAdmin={false} />
              ))}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Projets au total</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">
                    {projects.reduce((s, p) => s + (p.images?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Images</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {projects.reduce((s, p) => s + (p.files?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Fichiers</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;