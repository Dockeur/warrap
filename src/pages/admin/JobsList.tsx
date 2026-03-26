// src/pages/admin/JobsList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchJobs, fetchManagerProjects } from '../../features/jobs/jobsSlice';
import { ROUTES } from '../../utils/constants';

const JobsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, isLoading, managerPagination } = useAppSelector((s) => s.jobs);
  const { user } = useAppSelector((s) => s.auth);

  const isAdmin     = user?.role === 'admin';
  const isValidator = user?.role === 'validator';
  const isManager   = user?.role === 'manager';
  const canAccess   = isAdmin || isValidator || isManager;

  // ── État recherche / pagination (manager) ─────────────────────────────────
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,        setPage]        = useState(1);

  // ─── Chargement ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canAccess) return;
    if (isManager) {
      dispatch(fetchManagerProjects({ name: search, perPage: 10, page }));
    } else {
      dispatch(fetchJobs());
    }
  }, [dispatch, canAccess, isManager, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getLocName = (loc: any): string | null => {
    if (!loc) return null;
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object' && loc.name) return loc.name;
    return null;
  };

  const hasLaunch = (job: any) => !!job.started_at;

  const getStatusBadge = (job: any) => {
    const ls = job.launch_status;
    if (!hasLaunch(job))
      return { label: 'Non planifié', color: 'bg-orange-100 text-orange-600' };
    if (ls === 'completed' || (job.ended_at && new Date() > new Date(job.ended_at)))
      return { label: 'Terminé', color: 'bg-gray-100 text-gray-600' };
    if (ls === 'ongoing')
      return { label: 'En cours', color: 'bg-green-100 text-green-700' };
    if (ls === 'pending')
      return { label: 'En attente', color: 'bg-orange-100 text-orange-600' };
    return { label: 'À venir', color: 'bg-blue-100 text-blue-700' };
  };

  // ── Séparation admin/validator uniquement ─────────────────────────────────
  const configured   = jobs.filter((j) => hasLaunch(j));
  const unconfigured = jobs.filter((j) => !hasLaunch(j));

  // ─── Accès refusé ─────────────────────────────────────────────────────────
  if (!canAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Accès réservé aux administrateurs, validateurs et managers.</p>
      </div>
    );
  }

  // ─── Carte projet ─────────────────────────────────────────────────────────
  const JobCard = ({ job }: { job: any }) => {
    const status  = getStatusBadge(job);
    const locName = getLocName(job.localisation);
    const launched = hasLaunch(job);

    return (
      <Link
        to={ROUTES.ADMIN_DETAILJOBS.replace(':id', String(job.id))}
        className="bg-white rounded-xl shadow hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col"
      >
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs text-gray-400">#{job.id}</span>
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
            {job.name}
          </h3>

          {launched ? (
            <div className="space-y-1 mb-4 text-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span>Début</span>
                <span className="font-medium text-gray-700">{formatDate(job.started_at)}</span>
              </div>
              {job.ended_at && (
                <div className="flex items-center justify-between text-gray-500">
                  <span>Fin</span>
                  <span className="font-medium text-gray-700">{formatDate(job.ended_at)}</span>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center justify-between text-gray-500">
                  <span>Durée</span>
                  <span className="font-medium text-gray-700">{job.deadline} jours</span>
                </div>
              )}
              {locName && (
                <div className="flex items-center justify-between text-gray-500">
                  <span>Localisation</span>
                  <span className="font-medium text-gray-700 truncate max-w-[120px]">{locName}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-lg">
              <p className="text-xs font-medium text-orange-600">Lancement non configuré</p>
              <p className="text-xs text-orange-400 mt-0.5">Dates et localisation à définir</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {Array.from({ length: Math.min(job.workers_found ?? 0, 3) }).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs text-blue-600 font-bold">
                    {i + 1}
                  </div>
                ))}
                {(job.workers_found ?? 0) > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-bold">
                    +{job.workers_found - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {job.workers_found ?? 0} travailleur{(job.workers_found ?? 0) > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-blue-600 text-xs font-medium group-hover:underline">Voir →</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isManager ? 'Mes projets' : 'Projets acceptés'}
        </h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-gray-500">
            {isManager
              ? `${managerPagination.total} projet${managerPagination.total > 1 ? 's' : ''} au total`
              : `${jobs.length} projet${jobs.length > 1 ? 's' : ''} au total`
            }
          </span>
          {!isManager && configured.length > 0 && (
            <span className="px-2.5 py-0.5 bg-green-50 border border-green-100 text-green-700 rounded-full text-xs font-medium">
              {configured.length} configuré{configured.length > 1 ? 's' : ''}
            </span>
          )}
          {!isManager && unconfigured.length > 0 && (
            <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-full text-xs font-medium">
              {unconfigured.length} à configurer
            </span>
          )}
        </div>
      </div>

      {/* ── Barre de recherche (manager uniquement) ── */}
      {isManager && (
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un projet par nom..."
              className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchInput && (
              <button type="button" onClick={handleSearchClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ×
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
            Rechercher
          </button>
        </form>
      )}

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-lg">
            {isManager && search
              ? `Aucun projet trouvé pour "${search}"`
              : 'Aucun projet disponible pour l\'instant'
            }
          </p>
          {isManager && search && (
            <button onClick={handleSearchClear} className="mt-3 text-blue-600 hover:underline text-sm">
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : isManager ? (
        /* ── Vue manager : liste plate avec pagination ── */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Pagination */}
          {managerPagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={managerPagination.current_page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>

              <div className="flex gap-1">
                {Array.from({ length: managerPagination.last_page }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 ||
                    p === managerPagination.last_page ||
                    Math.abs(p - managerPagination.current_page) <= 1
                  )
                  .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${i}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          managerPagination.current_page === item
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(managerPagination.last_page, p + 1))}
                disabled={managerPagination.current_page >= managerPagination.last_page}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}

          {managerPagination.last_page > 1 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Page {managerPagination.current_page} sur {managerPagination.last_page}
              {' '}· {managerPagination.total} projet{managerPagination.total > 1 ? 's' : ''} au total
            </p>
          )}
        </div>
      ) : (
        /* ── Vue admin/validator : groupée par statut ── */
        <div className="space-y-10">
          {configured.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  Lancement configuré
                </h2>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {configured.length}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {configured.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}

          {unconfigured.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                  En attente de configuration
                </h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                  {unconfigured.length}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {unconfigured.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsList;