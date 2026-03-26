// src/pages/engineer/EngineerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase,
  FiPlus,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiXCircle,
  FiShield,
  FiLayers,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { ROUTES } from '../../utils/constants';
import { fetchWorker, fetchWorkerProjects } from '../../features/applications/applicationsSlice';
import { fetchProjects } from '../../features/projects/projectsSlice';

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const Card = ({ icon, title, value, color = 'text-blue-600', border = 'border-blue-100' }: any) => (
  <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${border}`}>
    <div className={`text-2xl mb-3 ${color}`}>{icon}</div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const Tab = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const QuickAction = ({ icon, label, to }: any) => (
  <Link to={to} className="flex items-center gap-3 bg-white border p-4 rounded-xl hover:bg-gray-50 transition-colors">
    <span className="text-blue-600">{icon}</span>
    <span className="font-medium text-gray-700">{label}</span>
  </Link>
);

// ─── VALIDATOR DASHBOARD ─────────────────────────────────────────────────────

const ValidatorDashboard: React.FC<{ user: any }> = ({ user }) => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.projects);
  const isLoading = useAppSelector((state) => state.projects.isLoading);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Calculs basés sur les projets de la plateforme
  const total    = projects.length;
  const valides  = projects.filter((p: any) => p.status !== 'unpublished').length;
  const refuses  = projects.filter((p: any) => p.status === 'rejected' || p.status === 'cancelled').length;
  const enAttente = projects.filter((p: any) => p.status === 'unpublished').length;

  const firstName = user?.contact?.firstName || user?.name || 'Validateur';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <FiShield className="h-3 w-3" />{user?.role === 'manager'?"Manageur": 'Validateur'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Tableau de bord de validation des projets</p>
          </div>
          <Link
            to={ROUTES.ENGINEER_PROJECTS}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <FiLayers className="h-4 w-4" />
            Voir tous les projets
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* BANDEAU INFO */}
        <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-start gap-4">
          <FiShield className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-900">Espace Validateur</p>
            <p className="text-purple-700 text-sm mt-1">
              Vous avez accès à l'ensemble des projets soumis sur la plateforme. 
              Consultez, validez et ajoutez des observations sur les projets en attente.
            </p>
          </div>
        </div>

        {/* STATS */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow p-6 border animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-3" />
                <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card
              icon={<FiLayers />}
              title="Total projets plateforme"
              value={total}
              color="text-blue-600"
              border="border-l-blue-500"
            />
            <Card
              icon={<FiAlertCircle />}
              title="En attente de validation"
              value={enAttente}
              color="text-orange-500"
              border="border-l-orange-400"
            />
            <Card
              icon={<FiCheckCircle />}
              title="Projets validés"
              value={valides}
              color="text-green-600"
              border="border-l-green-500"
            />
            <Card
              icon={<FiXCircle />}
              title="Projets refusés"
              value={refuses}
              color="text-red-500"
              border="border-l-red-400"
            />
          </div>
        )}

        {/* ACTIONS RAPIDES */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to={ROUTES.ENGINEER_PROJECTS}
            className="flex items-center gap-4 bg-white border border-purple-200 p-5 rounded-xl hover:shadow-md transition-all hover:border-purple-400"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiLayers className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Projets à valider</p>
              <p className="text-sm text-gray-500">{enAttente} projet{enAttente !== 1 ? 's' : ''} en attente</p>
            </div>
          </Link>

          <div className="bg-purple-600 text-white rounded-xl p-5">
            <h3 className="font-bold mb-3 flex gap-2 items-center">
              <FiAlertCircle /> Support
            </h3>
            <p className="text-sm mb-3 text-purple-200">Besoin d'aide ?</p>
            <p className="text-sm flex gap-2 items-center text-purple-100">
              <FiMail /> support@example.com
            </p>
            <p className="text-sm flex gap-2 items-center text-purple-100 mt-1">
              <FiPhone /> +237 686 741 680
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── CORRECTOR DASHBOARD ──────────────────────────────────────────────────────

const CorrectorDashboard: React.FC<{ user: any }> = ({ user }) => {
  const dispatch = useAppDispatch();

  const { myProjects, isLoading: isProjectsLoading } = useAppSelector((state) => state.projects);
  const { dashboard, acceptedProjects, isLoading: isApplicationsLoading } = useAppSelector((state) => state.applications);

  const stats = dashboard?.data;
  const [activeTab, setActiveTab] = useState<'active' | 'open' | 'all'>('active');

  useEffect(() => {
    dispatch(fetchWorker());
    dispatch(fetchWorkerProjects());
  }, [dispatch]);

  const activeProjects    = myProjects.filter((p) => p.status === 'in_progress');
  const openProjects      = myProjects.filter((p) => p.status === 'open');

  const displayedProjects =
    activeTab === 'active' ? activeProjects :
    activeTab === 'open'   ? openProjects   :
    myProjects;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {user?.name} 👋</h1>
            <p className="text-gray-500 text-sm">Gérez vos projets</p>
          </div>
          <Link
            to={ROUTES.ENGINEER_CREATE_PROJECT}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <FiPlus className="h-4 w-4" />
            Créer un projet
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card icon={<FiBriefcase />}    title="Projets actifs"  value={activeProjects.length}          border="border-l-blue-500"   color="text-blue-600"  />
          <Card icon={<FiCheckCircle />}  title="Projets acceptés" value={acceptedProjects.length}       border="border-l-green-500"  color="text-green-600" />
          <Card icon={<FiFileText />}     title="Projets rejetés" value={stats?.rejected_projects ?? 0}  border="border-l-red-400"    color="text-red-500"   />
          <Card icon={<FiTrendingUp />}   title="Total projets"   value={stats?.total_projects ?? 0}     border="border-l-purple-500" color="text-purple-600"/>
        </div>

        {/* ACCEPTED PROJECTS TABLE */}
        <div className="bg-white rounded-xl shadow border p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <FiCheckCircle className="text-green-600" /> Projets Acceptés
          </h2>
          {isApplicationsLoading ? (
            <p className="text-center py-6 text-gray-500">Chargement...</p>
          ) : acceptedProjects.length === 0 ? (
            <p className="text-center py-6 text-gray-500">Aucun projet accepté pour le moment</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="px-4 py-3 border font-semibold">Titre</th>
                    <th className="px-4 py-3 border font-semibold">Montant actuel</th>
                    <th className="px-4 py-3 border font-semibold">Montant à percevoir</th>
                    <th className="px-4 py-3 border font-semibold">Ventes totales</th>
                    <th className="px-4 py-3 border font-semibold">Montant reçu</th>
                    <th className="px-4 py-3 border font-semibold">Date de fixation</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50 text-gray-800">
                      <td className="px-4 py-3 border font-medium">{proj.name}</td>
                      <td className="px-4 py-3 border">{proj.current_amount}</td>
                      <td className="px-4 py-3 border">{proj.amount_to_perceive}</td>
                      <td className="px-4 py-3 border">{proj.total_sales}</td>
                      <td className="px-4 py-3 border">{proj.total_amount_received}</td>
                      <td className="px-4 py-3 border">
                        {new Date(proj.amount_set_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PROJECT LIST avec onglets */}
        <div className="bg-white rounded-xl shadow border p-6 mb-8">
          <div className="flex gap-3 mb-6">
            <Tab label={`Actifs (${activeProjects.length})`}   active={activeTab === 'active'} onClick={() => setActiveTab('active')} />
            <Tab label={`Ouverts (${openProjects.length})`}    active={activeTab === 'open'}   onClick={() => setActiveTab('open')}   />
            <Tab label={`Tous (${myProjects.length})`}          active={activeTab === 'all'}    onClick={() => setActiveTab('all')}    />
          </div>

          {isProjectsLoading ? (
            <p className="text-center py-10 text-gray-500">Chargement...</p>
          ) : displayedProjects.length === 0 ? (
            <p className="text-center py-10 text-gray-500">Aucun projet</p>
          ) : (
            <div className="space-y-4">
              {displayedProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 flex justify-between items-center hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                  <div>
                    <h3 className="font-bold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
                  </div>
                  <Link
                    to={`${ROUTES.ENGINEER_PROJECTS}/${project.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Voir
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS RAPIDES */}
        <div className="grid md:grid-cols-2 gap-6">
          <QuickAction icon={<FiPlus />}  label="Créer un projet" to={ROUTES.ENGINEER_CREATE_PROJECT} />
          <QuickAction icon={<FiUser />}  label="Mon profil"       to={ROUTES.PROFILE} />
          <div className="bg-blue-600 text-white rounded-xl p-6 md:col-span-2">
            <h3 className="font-bold mb-3 flex gap-2 items-center">
              <FiAlertCircle /> Support
            </h3>
            <p className="text-sm mb-2 text-blue-200">Besoin d'aide ?</p>
            <p className="text-sm flex gap-2 items-center text-blue-100"><FiMail /> support@example.com</p>
            <p className="text-sm flex gap-2 items-center text-blue-100 mt-1"><FiPhone /> +237 686 741 680</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL (routing par rôle) ───────────────────────────────────

const EngineerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isValidator = user?.role === 'validator' || user?.role === 'manager';

  if (isValidator) return <ValidatorDashboard user={user} />;
  return <CorrectorDashboard user={user} />;
};

export default EngineerDashboard;