// src/pages/admin/CommissionsManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  FiAward, FiPlus, FiSearch, FiTrash2, FiEdit3,
  FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle,
  FiDollarSign, FiTrendingUp, FiLoader,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import commercialService, {
  Commission, CommissionStatus, CreateCommissionPayload,
} from '../../features/commercial/commercialService';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<CommissionStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  pending:   { label: 'En attente', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  icon: <FiClock className="w-3.5 h-3.5" />       },
  paid:      { label: 'Payée',      bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: <FiCheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Annulée',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: <FiXCircle className="w-3.5 h-3.5" />     },
};

const StatusBadge: React.FC<{ status: CommissionStatus }> = ({ status }) => {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      {m.icon}{m.label}
    </span>
  );
};

// ─── MODAL CRÉER COMMISSION ───────────────────────────────────────────────────

const CreateCommissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState<CreateCommissionPayload>({
    project_sold_id: 0,
    account_type_id: 0,
    rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const set = (field: keyof CreateCommissionPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));

  const validate = () => {
    const e: any = {};
    if (!form.project_sold_id) e.project_sold_id = 'Requis';
    if (!form.account_type_id) e.account_type_id = 'Requis';
    if (!form.rate || form.rate <= 0 || form.rate > 100) e.rate = 'Entre 0.01 et 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await commercialService.createCommission(form);
      toast.success('Commission créée avec succès');
      onCreated();
      onClose();
      setForm({ project_sold_id: 0, account_type_id: 0, rate: 0 });
    } catch (err: any) {
    //   toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Créer une commission</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pour un commercial</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* project_sold_id */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ID de vente (project_sold_id) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.project_sold_id || ''}
              onChange={set('project_sold_id')}
              placeholder="Ex: 1"
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-0 transition-colors ${
                errors.project_sold_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.project_sold_id && <p className="mt-1 text-xs text-red-600">{errors.project_sold_id}</p>}
          </div>

          {/* account_type_id */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ID compte commercial (account_type_id) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.account_type_id || ''}
              onChange={set('account_type_id')}
              placeholder="Ex: 5"
              className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-0 transition-colors ${
                errors.account_type_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            {errors.account_type_id && <p className="mt-1 text-xs text-red-600">{errors.account_type_id}</p>}
          </div>

          {/* rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Taux de commission (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={form.rate || ''}
                onChange={set('rate')}
                placeholder="Ex: 5.5"
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-xl text-sm focus:outline-none focus:ring-0 transition-colors ${
                  errors.rate ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
            </div>
            {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><FiLoader className="animate-spin w-4 h-4" />Création...</>
                : <><FiPlus className="w-4 h-4" />Créer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── MODAL MODIFIER STATUT ────────────────────────────────────────────────────

const UpdateStatusModal: React.FC<{
  commission: Commission | null;
  onClose: () => void;
  onUpdated: () => void;
}> = ({ commission, onClose, onUpdated }) => {
  const [status, setStatus] = useState<CommissionStatus>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (commission) setStatus(commission.status);
  }, [commission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commission) return;
    setLoading(true);
    try {
      await commercialService.updateCommissionStatus(commission.id, { status });
      toast.success('Statut mis à jour');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  if (!commission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Modifier le statut</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Commission</p>
          <p className="font-semibold text-gray-900 text-sm">
            {commission.project_sold?.project?.name || `#${commission.id}`}
          </p>
          <div className="mt-1">
            <StatusBadge status={commission.status} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-5">
            {(['pending', 'paid', 'cancelled'] as CommissionStatus[]).map(s => {
              const m = STATUS_META[s];
              return (
                <label key={s}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    status === s ? `${m.bg} ${m.border}` : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="status" value={s}
                    checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
                  <span className={`flex-shrink-0 ${status === s ? m.text : 'text-gray-400'}`}>{m.icon}</span>
                  <span className={`text-sm font-medium ${status === s ? m.text : 'text-gray-600'}`}>{m.label}</span>
                  {status === s && <FiCheck className={`ml-auto w-4 h-4 ${m.text}`} />}
                </label>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const CommissionsManagement: React.FC = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCommission, setEditCommission] = useState<Commission | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { fetchCommissions(); }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const data = await commercialService.getAllCommissions();
      setCommissions(data);
    } catch {
      toast.error('Erreur lors du chargement des commissions');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette commission ?')) return;
    setDeletingId(id);
    try {
      await commercialService.deleteCommission(id);
      toast.success('Commission supprimée');
      fetchCommissions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally { setDeletingId(null); }
  };

  const filtered = commissions.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (c.project_sold?.project?.name || '').toLowerCase().includes(q) ||
      (c.project_sold?.customer_of_name || '').toLowerCase().includes(q) ||
      (c.commercial?.email || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total:     commissions.length,
    pending:   commissions.filter(c => c.status === 'pending').length,
    paid:      commissions.filter(c => c.status === 'paid').length,
    cancelled: commissions.filter(c => c.status === 'cancelled').length,
    totalPaid: commissions.filter(c => c.status === 'paid').reduce((s, c) => s + (c.amount ?? 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FiAward className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion des commissions</h1>
            </div>
            <p className="text-gray-500 text-sm">Gérez et suivez les commissions des commerciaux</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-sm text-sm transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Créer une commission
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total',        value: stats.total,     color: 'text-blue-700',   bg: 'bg-blue-50  border-blue-100'   },
            { label: 'En attente',   value: stats.pending,   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-100'  },
            { label: 'Payées',       value: stats.paid,      color: 'text-green-700',  bg: 'bg-green-50 border-green-100'  },
            { label: 'Annulées',     value: stats.cancelled, color: 'text-red-700',    bg: 'bg-red-50   border-red-100'    },
            { label: 'Montant payé', value: `${stats.totalPaid.toLocaleString('fr-FR')} FCFA`, color: 'text-gray-800', bg: 'bg-gray-50 border-gray-200' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.color} leading-tight`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { value: '',          label: 'Toutes'     },
              { value: 'pending',   label: 'En attente' },
              { value: 'paid',      label: 'Payées'     },
              { value: 'cancelled', label: 'Annulées'   },
            ].map(f => (
              <button key={f.value}
                onClick={() => setStatusFilter(f.value as CommissionStatus | '')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === f.value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par projet, client, commercial..."
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
                {search || statusFilter ? 'Aucun résultat' : 'Aucune commission créée'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['#', 'Projet', 'Client', 'Commercial', 'Taux', 'Montant', 'Statut', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-xs text-gray-400 font-mono">#{c.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900 max-w-[160px] truncate">
                          {c.project_sold?.project?.name || `Projet #${c.project_sold_id}`}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-[140px] truncate">
                        {c.project_sold?.customer_of_name || '—'}
                      </td>
                      <td className="px-4 py-4">
                        {c.commercial ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {c.commercial.contact?.firstName} {c.commercial.contact?.lastName}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.commercial.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                          <FiTrendingUp className="w-3 h-3" />{c.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {c.amount != null ? (
                          <span className="text-sm font-bold text-gray-900">
                            {c.amount.toLocaleString('fr-FR')} FCFA
                          </span>
                        ) : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditCommission(c)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier le statut"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                            title="Supprimer"
                          >
                            {deletingId === c.id
                              ? <FiLoader className="animate-spin w-4 h-4" />
                              : <FiTrash2 className="w-4 h-4" />}
                          </button>
                        </div>
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

      <CreateCommissionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchCommissions}
      />
      <UpdateStatusModal
        commission={editCommission}
        onClose={() => setEditCommission(null)}
        onUpdated={fetchCommissions}
      />
    </div>
  );
};

export default CommissionsManagement;