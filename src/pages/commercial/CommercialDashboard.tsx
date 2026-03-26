// src/pages/commercial/CommercialDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp, FiDollarSign, FiShoppingBag, FiAward,
  FiArrowRight, FiClock, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import { useAppSelector } from '../../store/store';
import commercialService, { Commission, PublicProject } from '../../features/commercial/commercialService';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending:   { label: 'En attente', bg: 'bg-amber-50',  text: 'text-amber-700',  icon: <FiClock className="w-3 h-3" />       },
  paid:      { label: 'Payée',      bg: 'bg-green-50',  text: 'text-green-700',  icon: <FiCheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Annulée',    bg: 'bg-red-50',    text: 'text-red-700',    icon: <FiXCircle className="w-3 h-3" />     },
};

const CommissionBadge: React.FC<{ status: string }> = ({ status }) => {
  const m = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      {m.icon}{m.label}
    </span>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const CommercialDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, p] = await Promise.all([
          commercialService.getMyCommissions(),
          commercialService.getPublishedProjects(),
        ]);
        setCommissions(c);
        setProjects(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.contact?.firstName || user?.email?.split('@')[0] || 'Commercial';

  const totalCommissions = commissions.length;
  const paidCommissions  = commissions.filter(c => c.status === 'paid').length;
  const pendingAmount    = commissions
    .filter(c => c.status === 'pending')
    .reduce((s, c) => s + (c.amount ?? 0), 0);
  const paidAmount = commissions
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + (c.amount ?? 0), 0);

  const recentCommissions = [...commissions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, {firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1">Voici un aperçu de votre activité commerciale</p>
          </div>
          <Link
            to="/commercial/projects"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
          >
            <FiShoppingBag className="w-4 h-4" />
            Voir les projets
          </Link>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Projets disponibles',
              value: projects.length,
              icon: <FiShoppingBag className="w-6 h-6 text-blue-500" />,
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              val: 'text-blue-700',
            },
            {
              label: 'Commissions totales',
              value: totalCommissions,
              icon: <FiAward className="w-6 h-6 text-purple-500" />,
              bg: 'bg-purple-50',
              border: 'border-purple-100',
              val: 'text-purple-700',
            },
            {
              label: 'Commissions payées',
              value: `${paidAmount.toLocaleString('fr-FR')} FCFA`,
              icon: <FiCheckCircle className="w-6 h-6 text-green-500" />,
              bg: 'bg-green-50',
              border: 'border-green-100',
              val: 'text-green-700',
            },
            {
              label: 'En attente de paiement',
              value: `${pendingAmount.toLocaleString('fr-FR')} FCFA`,
              icon: <FiDollarSign className="w-6 h-6 text-amber-500" />,
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              val: 'text-amber-700',
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                {s.icon}
              </div>
              <p className={`text-2xl font-bold ${s.val} leading-tight`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── DERNIÈRES COMMISSIONS ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">Dernières commissions</h2>
              </div>
              <Link to="/commercial/commissions"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Tout voir <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentCommissions.length === 0 ? (
              <div className="p-10 text-center">
                <FiAward className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune commission pour le moment</p>
                <p className="text-gray-400 text-xs mt-1">Enregistrez des ventes pour gagner des commissions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentCommissions.map((c) => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {c.project_sold?.project?.name || `Projet #${c.project_sold_id}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Client : {c.project_sold?.customer_of_name || '—'}
                        {' · '}
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <CommissionBadge status={c.status} />
                      {c.amount != null && (
                        <span className="text-xs font-bold text-gray-700">
                          {c.amount.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── PROJETS RÉCENTS ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">Projets en vente</h2>
              </div>
              <Link to="/commercial/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Tout voir <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-10 text-center">
                <FiShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun projet disponible</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {projects.slice(0, 5).map((p) => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FiShoppingBag className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        {p.amount && parseFloat(p.amount) > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            {parseFloat(p.amount).toLocaleString('fr-FR')} FCFA
                          </p>
                        )}
                      </div>
                    </div>
                    <Link to={`/commercial/projects/${p.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-3 flex-shrink-0">
                      Détails <FiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RÉSUMÉ COMMISSIONS PAR STATUT ── */}
        {commissions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-blue-600" />
              Récapitulatif des commissions
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { status: 'pending',   label: 'En attente', color: 'text-amber-600',  bg: 'bg-amber-50', border: 'border-amber-100'  },
                { status: 'paid',      label: 'Payées',     color: 'text-green-600',  bg: 'bg-green-50', border: 'border-green-100'  },
                { status: 'cancelled', label: 'Annulées',   color: 'text-red-600',    bg: 'bg-red-50',   border: 'border-red-100'    },
              ].map((s) => {
                const count = commissions.filter(c => c.status === s.status).length;
                const amount = commissions
                  .filter(c => c.status === s.status)
                  .reduce((sum, c) => sum + (c.amount ?? 0), 0);
                return (
                  <div key={s.status} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{count}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    {amount > 0 && (
                      <p className={`text-xs font-semibold ${s.color} mt-1`}>
                        {amount.toLocaleString('fr-FR')} FCFA
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommercialDashboard;