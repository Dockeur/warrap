// src/pages/commercial/MyCommissions.tsx
import React, { useEffect, useState } from 'react';
import {
  FiAward, FiClock, FiCheckCircle, FiAlertCircle,
  FiDollarSign, FiSearch, FiTrendingUp,
} from 'react-icons/fi';
import commercialService from '../../features/commercial/commercialService';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Commission {
  id: number;
  project_name: string;
  project_uuid: string;
  project_sold_id: number;
  customer_name: string;
  sale_amount: string;
  rate: string;
  commission_amount: string;
  total_paid: number;
  remaining_amount: number;
  created_at: string;
}

interface Summary {
  total_commissions: number;
  total_paid: number;
  total_remaining: number;
  count_commissions: number;
}

type DerivedStatus = 'paid' | 'partial' | 'pending';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const deriveStatus = (c: Commission): DerivedStatus => {
  if (c.remaining_amount === 0) return 'paid';
  if (c.total_paid > 0)        return 'partial';
  return 'pending';
};

const STATUS_META: Record<DerivedStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <FiClock       className="w-3.5 h-3.5" /> },
  paid:    { label: 'Payée',      bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: <FiCheckCircle  className="w-3.5 h-3.5" /> },
  partial: { label: 'Partielle',  bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-200',  icon: <FiAlertCircle  className="w-3.5 h-3.5" /> },
};

const StatusBadge: React.FC<{ status: DerivedStatus }> = ({ status }) => {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      {m.icon}{m.label}
    </span>
  );
};

const fmt = (n: number | string) => Number(n).toLocaleString('fr-FR');

const FILTERS: { value: DerivedStatus | ''; label: string }[] = [
  { value: '',        label: 'Toutes'     },
  { value: 'pending', label: 'En attente' },
  { value: 'partial', label: 'Partielles' },
  { value: 'paid',    label: 'Payées'     },
];

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const MyCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary]           = useState<Summary | null>(null);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<DerivedStatus | ''>('');
  const [search, setSearch]             = useState('');

  useEffect(() => { fetchCommissions(); }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await commercialService.getMyCommissions();
      setCommissions(res.data ?? []);
      setSummary(res.summary ?? null);
      console.log("commission", commissions);
      
    } catch (e) {
      console.error('Erreur commissions:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = commissions.filter(c => {
    const matchStatus = !statusFilter || deriveStatus(c) === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.project_name.toLowerCase().includes(q) ||
      c.customer_name.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const countByStatus = (s: DerivedStatus) =>
    commissions.filter(c => deriveStatus(c) === s).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FiAward className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mes commissions</h1>
          </div>
          <p className="text-gray-500 text-sm">Suivez l'état de toutes vos commissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total commissions', value: summary?.count_commissions ?? commissions.length,  color: 'text-blue-700',  bg: 'bg-blue-50  border-blue-100'  },
            { label: 'En attente',        value: countByStatus('pending'),                           color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Montant perçu',     value: `${fmt(summary?.total_paid ?? 0)} FCFA`,           color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
            { label: 'Reste à percevoir', value: `${fmt(summary?.total_remaining ?? 0)} FCFA`,      color: 'text-red-700',   bg: 'bg-red-50   border-red-100'   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.color} leading-tight`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtres + Recherche */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
                {f.value !== '' && (
                  <span className="ml-1.5 text-gray-400">
                    ({countByStatus(f.value as DerivedStatus)})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Projet, client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-14 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <FiAward className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">Aucune commission</p>
              <p className="text-sm text-gray-400 mt-1">
                {search || statusFilter
                  ? 'Aucun résultat pour ces filtres'
                  : 'Enregistrez des ventes pour gagner des commissions'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Projet', 'Client', 'Montant vente', 'Taux', 'Commission', 'Perçu', 'Restant', 'Statut', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">

                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{c.project_name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{c.project_uuid}</p>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {c.customer_name || '—'}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                        {fmt(c.sale_amount)} FCFA
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                          <FiTrendingUp className="w-3.5 h-3.5" />{c.rate}%
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <FiDollarSign className="w-3.5 h-3.5 text-green-600" />
                          {fmt(c.commission_amount)} FCFA
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-green-700 whitespace-nowrap">
                        {fmt(c.total_paid)} FCFA
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap">
                        <span className={c.remaining_amount > 0 ? 'text-red-600' : 'text-gray-400'}>
                          {fmt(c.remaining_amount)} FCFA
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={deriveStatus(c)} />
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 text-right">
            {filtered.length} commission{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyCommissions;