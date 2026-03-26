// src/pages/commercial/CommercialProjects.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiImage, FiDollarSign, FiUser, FiCalendar,
  FiEye, FiShoppingBag, FiX, FiCheck, FiFileText,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import commercialService, { PublicProject } from '../../features/commercial/commercialService';

// ─── MODAL ENREGISTRER UNE VENTE ─────────────────────────────────────────────

const SaleModal: React.FC<{
  project: PublicProject | null;
  onClose: () => void;
  onSold: () => void;
}> = ({ project, onClose, onSold }) => {
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { setError('Le nom du client est requis'); return; }
    if (!project) return;
    setLoading(true);
    try {
      await commercialService.registerSale(project.id, { customer_of_name: customerName.trim() });
      toast.success('Vente enregistrée avec succès !');
      onSold();
      onClose();
    } catch (err: any) {
    //   toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Enregistrer une vente</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{project.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {project.amount && parseFloat(project.amount) > 0 && (
          <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <FiDollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-green-600 font-medium">Prix du projet</p>
              <p className="text-lg font-bold text-green-700">
                {parseFloat(project.amount).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du client <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setError(''); }}
              placeholder="Ex: Jean Martin"
              autoFocus
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors text-sm ${
                error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading || !customerName.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>Enregistrement...</>
              ) : (
                <><FiCheck className="w-4 h-4" />Confirmer la vente</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CARD PROJET ──────────────────────────────────────────────────────────────

const ProjectCard: React.FC<{
  project: PublicProject;
  onSell: (p: PublicProject) => void;
  onView: (p: PublicProject) => void;
}> = ({ project, onSell, onView }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200">
    {/* Image */}
    <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200">
      {project.images?.[0] ? (
        <img src={project.images[0].url} alt={project.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <FiImage className="w-12 h-12 text-gray-300" />
        </div>
      )}
      {project.amount && parseFloat(project.amount) > 0 && (
        <div className="absolute top-3 left-3">
          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {parseFloat(project.amount).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      )}
      {(project.project_solds?.length ?? 0) > 0 && (
        <div className="absolute top-3 right-3">
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <FiUser className="w-3 h-3" />
            {project.project_solds!.length} vente{project.project_solds!.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>

    {/* Body */}
    <div className="p-5">
      <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{project.name}</h3>
      <p className="text-xs text-gray-400 font-mono mb-3">{project.uuid}</p>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {project.description || 'Aucune description disponible'}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 pb-4 border-b border-gray-100">
        <span className="flex items-center gap-1.5">
          <FiUser className="w-3.5 h-3.5" />
          {project.user?.contact?.firstName} {project.user?.contact?.lastName}
        </span>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5" />
          {new Date(project.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(project)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all text-sm font-medium"
        >
          <FiEye className="w-4 h-4" /> Détails
        </button>
        <button
          onClick={() => onSell(project)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <FiShoppingBag className="w-4 h-4" /> Vendre
        </button>
      </div>
    </div>
  </div>
);

// ─── MODAL DÉTAIL PROJET ──────────────────────────────────────────────────────

const ProjectDetailModal: React.FC<{
  project: PublicProject | null;
  onClose: () => void;
  onSell: (p: PublicProject) => void;
}> = ({ project, onClose, onSell }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4 truncate">{project.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Images */}
        {project.images && project.images.length > 0 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {project.images.map((img) => (
              <img key={img.id} src={img.url} alt="" className="h-40 w-auto rounded-xl object-cover border border-gray-200 flex-shrink-0" />
            ))}
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Prix */}
          {project.amount && parseFloat(project.amount) > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FiDollarSign className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-medium">Prix de vente</p>
                <p className="text-2xl font-bold text-green-700">
                  {parseFloat(project.amount).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiFileText className="w-4 h-4" /> Description
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {project.description || 'Aucune description disponible'}
            </p>
          </div>

          {/* Infos */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Créateur</p>
              <p className="font-semibold text-gray-900">
                {project.user?.contact?.firstName} {project.user?.contact?.lastName}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Date de création</p>
              <p className="font-semibold text-gray-900">
                {new Date(project.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Ventes déjà enregistrées */}
          {project.project_solds && project.project_solds.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Ventes enregistrées ({project.project_solds.length})
              </h4>
              <div className="space-y-2">
                {project.project_solds.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />{s.customer_of_name}
                    </span>
                    <span className="text-xs text-blue-600">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <button
            onClick={() => { onClose(); onSell(project); }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
          >
            <FiShoppingBag className="w-5 h-5" />
            Enregistrer une vente pour ce projet
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const CommercialProjects: React.FC = () => {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [filtered, setFiltered] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saleProject, setSaleProject] = useState<PublicProject | null>(null);
  const [viewProject, setViewProject] = useState<PublicProject | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? projects.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
          )
        : projects
    );
  }, [search, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await commercialService.getPublishedProjects();
      setProjects(data);
    } catch {
      toast.error('Erreur lors du chargement des projets');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FiShoppingBag className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Projets en vente</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {filtered.length} projet{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Chargement des projets...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center">
            <FiShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'Aucun résultat' : 'Aucun projet disponible'}
            </h3>
            <p className="text-gray-400 text-sm">
              {search ? `Aucun projet ne correspond à "${search}"` : "Il n'y a pas de projet en vente pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onSell={setSaleProject}
                onView={setViewProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SaleModal
        project={saleProject}
        onClose={() => setSaleProject(null)}
        onSold={fetchProjects}
      />
      <ProjectDetailModal
        project={viewProject}
        onClose={() => setViewProject(null)}
        onSell={setSaleProject}
      />
    </div>
  );
};

export default CommercialProjects;