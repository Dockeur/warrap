// src/pages/engineer/ProjectDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiDownload, FiArrowLeft, FiCalendar, FiUser, FiFileText, FiX,
  FiImage, FiFile, FiEdit, FiTrash2, FiCheckCircle,
  FiAward, FiPlus, FiLoader, FiTrendingUp, FiChevronDown,
  FiDollarSign, FiClock, FiAlertCircle, FiChevronRight,
  FiEye, FiCreditCard, FiHash, FiZap, FiPackage,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  acceptProject, clearCurrentProject, clearError,
  fetchProjectById, selectCurrentProject, selectError,
  selectIsAccepting, selectIsLoading,
} from '../../features/projects/projectsSlice';
import ProjectObservationsWithAnnotations from '../admin/ProjectObservations';
import ProjectAmounts from '../admin/ProjectAmounts';
import ConfirmationModal from '../common/ConfirmationModal';
import projectService from '../../features/projects/projectsService';
import commercialService, {
  Commission, CommercialUser, CreateCommissionPayload,
} from '../../features/commercial/commercialService';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type DerivedStatus = 'pending' | 'partial' | 'paid';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n: number | string) =>
  Number(n).toLocaleString('fr-FR');

/** Montant total de la commission */
const commissionTotal = (c: Commission): number =>
  parseFloat(String(c.commission_amount ?? c.amount ?? 0));

/** Montant déjà versé — utilise total_paid de l'API si disponible */
const commissionPaid = (c: Commission): number =>
  c.total_paid ??
  (c.payments || []).reduce((s, p) => s + (p.amount_paid || 0), 0);

/** Reste à payer — utilise remaining_amount de l'API si disponible */
const commissionRemaining = (c: Commission): number =>
  c.remaining_amount ??
  (commissionTotal(c) - commissionPaid(c));

/** Statut dérivé des montants */
const deriveStatus = (c: Commission): DerivedStatus => {
  const remaining = commissionRemaining(c);
  const paid      = commissionPaid(c);
  const total     = commissionTotal(c);
  if (total > 0 && remaining <= 0) return 'paid';
  if (paid > 0)                    return 'partial';
  return 'pending';
};

/** Nom du commercial — compatible nouvelle et ancienne API */
const commercialFullName = (c: Commission): string => {
  if (c.commercial?.firstName || c.commercial?.lastName)
    return `${c.commercial.firstName ?? ''} ${c.commercial.lastName ?? ''}`.trim();
  const contact = (c.commercial as any)?.contact;
  if (contact?.firstName || contact?.lastName)
    return `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
  return '—';
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}> = ({ icon, label, value, sub, color, bg }) => (
  <div className={`rounded-2xl p-5 border ${bg} flex items-start gap-4`}>
    <div className={`p-2.5 rounded-xl ${color} bg-white/60 shadow-sm flex-shrink-0`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ─── ADD SOLD MODAL ───────────────────────────────────────────────────────────

const AddSoldModal: React.FC<{
  isOpen: boolean; onClose: () => void;
  onConfirm: (n: string) => Promise<void>; loading: boolean;
}> = ({ isOpen, onClose, onConfirm, loading }) => {
  const [name, setName]   = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Requis'); return; }
    try { await onConfirm(name.trim()); setName(''); setError(''); } catch {}
  };
  const close = () => { if (!loading) { setName(''); setError(''); onClose(); } };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl"><FiUser className="h-5 w-5 text-emerald-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">Ajouter une Vente</h3>
          </div>
          <button onClick={close} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du Client <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={name} autoFocus placeholder="Ex : Jean Dupont" disabled={loading}
              onChange={e => { setName(e.target.value); setError(''); }}
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors
                ${error ? 'border-red-300' : 'border-gray-200 focus:border-emerald-500'} disabled:bg-gray-50`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />{error}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={close} disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-emerald-700">
              {loading
                ? <><FiLoader className="animate-spin h-4 w-4" />Ajout...</>
                : <><FiPlus className="h-4 w-4" />Confirmer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CREATE COMMISSION MODAL ──────────────────────────────────────────────────

const CreateCommissionModal: React.FC<{
  isOpen: boolean; onClose: () => void; onCreated: () => void;
  projectSolds: { id: number; customer_of_name: string; created_at: string }[];
  projectName: string;
}> = ({ isOpen, onClose, onCreated, projectSolds, projectName }) => {
  const [commercials, setCommercials] = useState<CommercialUser[]>([]);
  const [loadingComm, setLoadingComm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<any>({});
  const [form, setForm] = useState<{
    project_sold_id: number | ''; account_type_id: number | ''; rate: string;
  }>({ project_sold_id: '', account_type_id: '', rate: '' });

  useEffect(() => {
    if (!isOpen) return;
    setLoadingComm(true);
    commercialService.getCommercials()
      .then(setCommercials)
      .catch(() => toast.error('Impossible de charger les commerciaux'))
      .finally(() => setLoadingComm(false));
    setForm(p => ({ ...p, project_sold_id: projectSolds.length === 1 ? projectSolds[0].id : '' }));
  }, [isOpen]);

  const validate = () => {
    const e: any = {};
    if (!form.project_sold_id) e.project_sold_id = 'Sélectionnez une vente';
    if (!form.account_type_id) e.account_type_id = 'Sélectionnez un commercial';
    const r = parseFloat(form.rate);
    if (!form.rate || isNaN(r) || r <= 0 || r > 100) e.rate = 'Taux entre 0.01 et 100';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await commercialService.createCommission({
        project_sold_id: form.project_sold_id as number,
        account_type_id: form.account_type_id as number,
        rate: parseFloat(form.rate),
      } as CreateCommissionPayload);
      toast.success('Commission créée !');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl"><FiAward className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Créer une commission</h3>
              <p className="text-xs text-gray-400 truncate max-w-xs">{projectName}</p>
            </div>
          </div>
          <button onClick={() => { if (!loading) onClose(); }} disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Vente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Vente associée <span className="text-red-500">*</span>
            </label>
            {projectSolds.length === 0
              ? <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  Aucune vente enregistrée pour ce projet.
                </div>
              : <div className="relative">
                  <select value={form.project_sold_id}
                    onChange={e => {
                      setForm(p => ({ ...p, project_sold_id: Number(e.target.value) || '' }));
                      setErrors((p: any) => ({ ...p, project_sold_id: undefined }));
                    }}
                    className={`w-full appearance-none px-4 py-2.5 pr-10 border-2 rounded-xl text-sm bg-white focus:outline-none
                      ${errors.project_sold_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`}>
                    <option value="">-- Sélectionner --</option>
                    {projectSolds.map(s => (
                      <option key={s.id} value={s.id}>#{s.id} — {s.customer_of_name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>}
            {errors.project_sold_id && <p className="mt-1 text-xs text-red-600">{errors.project_sold_id}</p>}
          </div>
          {/* Commercial */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Commercial <span className="text-red-500">*</span>
            </label>
            {loadingComm
              ? <div className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-400">
                  <FiLoader className="animate-spin w-4 h-4" />Chargement...
                </div>
              : <div className="relative">
                  <select value={form.account_type_id}
                    onChange={e => {
                      setForm(p => ({ ...p, account_type_id: Number(e.target.value) || '' }));
                      setErrors((p: any) => ({ ...p, account_type_id: undefined }));
                    }}
                    className={`w-full appearance-none px-4 py-2.5 pr-10 border-2 rounded-xl text-sm bg-white focus:outline-none
                      ${errors.account_type_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`}>
                    <option value="">-- Sélectionner --</option>
                    {commercials.map(c => (
                      <option key={c.id} value={c.account_type_id ?? c.id}>
                        {c.contact?.firstName} {c.contact?.lastName}{c.email ? ` — ${c.email}` : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>}
            {errors.account_type_id && <p className="mt-1 text-xs text-red-600">{errors.account_type_id}</p>}
          </div>
          {/* Taux */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Taux (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiTrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="number" step="0.01" min="0.01" max="100" value={form.rate} placeholder="Ex: 5.5"
                onChange={e => {
                  setForm(p => ({ ...p, rate: e.target.value }));
                  setErrors((p: any) => ({ ...p, rate: undefined }));
                }}
                className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl text-sm focus:outline-none
                  ${errors.rate ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
            </div>
            {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { if (!loading) onClose(); }} disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading || !projectSolds.length}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700">
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

// ─── ADD PAYMENT MODAL ────────────────────────────────────────────────────────

const AddPaymentModal: React.FC<{
  isOpen: boolean; onClose: () => void;
  onConfirm: (amount: number, note: string) => Promise<void>;
  loading: boolean; commissionId: number;
  commissionAmount?: number; alreadyPaid: number; remaining: number;
}> = ({ isOpen, onClose, onConfirm, loading, commissionAmount, alreadyPaid, remaining }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const e: any = {};
    const v = parseFloat(amount);
    if (!amount || isNaN(v) || v <= 0) e.amount = 'Montant invalide';
    else if (v > remaining)            e.amount = `Max : ${fmt(remaining)} FCFA`;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onConfirm(parseFloat(amount), note.trim());
      setAmount(''); setNote(''); setErrors({});
    } catch {}
  };

  const close = () => {
    if (!loading) { setAmount(''); setNote(''); setErrors({}); onClose(); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl"><FiCreditCard className="h-5 w-5 text-violet-600" /></div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Ajouter un paiement</h3>
              <p className="text-xs text-gray-400">Avance sur commission</p>
            </div>
          </div>
          <button onClick={close} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Résumé */}
          {commissionAmount != null && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-sm font-bold text-gray-800">{fmt(commissionAmount)}</p>
                <p className="text-xs text-gray-400">FCFA</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                <p className="text-xs text-blue-500 mb-1">Versé</p>
                <p className="text-sm font-bold text-blue-700">{fmt(alreadyPaid)}</p>
                <p className="text-xs text-blue-400">FCFA</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${remaining <= 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-xs mb-1 ${remaining <= 0 ? 'text-green-500' : 'text-amber-500'}`}>Restant</p>
                <p className={`text-sm font-bold ${remaining <= 0 ? 'text-green-700' : 'text-amber-700'}`}>{fmt(remaining)}</p>
                <p className={`text-xs ${remaining <= 0 ? 'text-green-400' : 'text-amber-400'}`}>FCFA</p>
              </div>
            </div>
          )}
          {/* Montant */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="number" step="1" min="1" value={amount} placeholder="Ex: 10000" autoFocus
                onChange={e => { setAmount(e.target.value); setErrors((p: any) => ({ ...p, amount: undefined })); }}
                className={`w-full pl-10 pr-16 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors
                  ${errors.amount ? 'border-red-300' : 'border-gray-200 focus:border-violet-500'}`} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">FCFA</span>
            </div>
            {errors.amount && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />{errors.amount}
              </p>
            )}
          </div>
          {/* Note */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Note <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="text" value={note} placeholder="Ex: Paiement partiel 1/3"
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500" />
          </div> */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={close} disabled={loading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              Annuler
            </button>
            <button type="submit" disabled={loading || !amount}
              className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-violet-700">
              {loading
                ? <><FiLoader className="animate-spin w-4 h-4" />Enregistrement...</>
                : <><FiCreditCard className="w-4 h-4" />Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── COMMISSION CARD ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<DerivedStatus, { label: string; cls: string; dot: string }> = {
  pending: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  paid:    { label: 'Payée',      cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  partial: { label: 'Partielle',  cls: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-400'  },
};

const CommissionCard: React.FC<{
  commission: Commission;
  canManagePayments: boolean;
  onAddPayment: (c: Commission) => void;
  onDeletePayment: (paymentId: number) => void;
}> = ({ commission, canManagePayments, onAddPayment, onDeletePayment }) => {
  const [expanded, setExpanded] = useState(false);

  const total       = commissionTotal(commission);
  const paid        = commissionPaid(commission);
  const remaining   = commissionRemaining(commission);
  const pct         = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const status      = deriveStatus(commission);
  const isFullyPaid = status === 'paid';
  const sc          = STATUS_MAP[status];
  const hasPayments = (commission.payments || []).length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4 flex items-start gap-3">
        {/* Icône */}
        <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0 mt-0.5">
          <FiAward className="w-4 h-4 text-blue-600" />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Nom + statut */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-900 text-sm">{commercialFullName(commission)}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
            </span>
            {isFullyPaid && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <FiCheckCircle className="w-3 h-3" />Soldée
              </span>
            )}
          </div>

          {/* Méta : id, projet, taux, montant total */}
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mb-2">
            <span className="flex items-center gap-1"><FiHash className="w-3 h-3" />#{commission.id}</span>
            {commission.project_name && (
              <span className="flex items-center gap-1 text-gray-500 font-medium">
                <FiPackage className="w-3 h-3" />{commission.project_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiTrendingUp className="w-3 h-3" />{commission.rate}%
            </span>
            {total > 0 && (
              <span className="flex items-center gap-1 font-semibold text-gray-600">
                <FiDollarSign className="w-3 h-3 text-blue-500" />{fmt(total)} FCFA
              </span>
            )}
          </div>

          {/* Barre de progression + montants */}
          {total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">
                  Versé : <span className="font-semibold text-gray-600">{fmt(paid)} FCFA</span>
                </span>
                <span className={`text-xs font-bold ${isFullyPaid ? 'text-green-600' : 'text-violet-600'}`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${isFullyPaid ? 'bg-green-500' : 'bg-violet-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!isFullyPaid && remaining > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Restant : {fmt(remaining)} FCFA
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {canManagePayments && !isFullyPaid && (
            <button onClick={() => onAddPayment(commission)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm whitespace-nowrap">
              <FiCreditCard className="w-3.5 h-3.5" />Paiement +
            </button>
          )}
          {hasPayments && (
            <button onClick={() => setExpanded(v => !v)}
              className={`p-1.5 rounded-xl transition-colors ${expanded ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-400'}`}>
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Historique paiements */}
      {expanded && hasPayments && (
        <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Historique — {commission.payments!.length} paiement{commission.payments!.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {commission.payments!.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                    <FiCheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{fmt(p.amount_paid || 0)} FCFA</p>
                    {p.note && <p className="text-xs text-gray-500 truncate max-w-[180px]">{p.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  {canManagePayments && (
                    <button onClick={() => onDeletePayment(p.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const ProjectDetails: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const project     = useAppSelector(selectCurrentProject);
  const isLoading   = useAppSelector(selectIsLoading);
  const isAccepting = useAppSelector(selectIsAccepting);
  const error       = useAppSelector(selectError);
  const { user }    = useAppSelector((state) => state.auth);

  const isAdmin        = user?.role === 'admin';
  const isValidator    = user?.role === 'validator';
  const isCorrector    = user?.role === 'corrector';
  const isProjectOwner = project?.user?.id === user?.id;

  const canAcceptProject  = isAdmin || isValidator;
  const canAddObservation = isAdmin || isValidator;
  const canEditProject    = isAdmin || (isCorrector && isProjectOwner);
  const canAddSale        = isAdmin;
  const canViewSales      = isAdmin || isValidator;
  const canViewAmounts    = isAdmin || isValidator || (isCorrector && isProjectOwner);
  const canManagePayments = isAdmin;

  const [selectedImage, setSelectedImage]           = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal]       = useState(false);
  const [isAddSoldOpen, setIsAddSoldOpen]           = useState(false);
  const [isCommissionOpen, setIsCommissionOpen]     = useState(false);
  const [loadingSold, setLoadingSold]               = useState(false);
  const [paymentTarget, setPaymentTarget]           = useState<Commission | null>(null);
  const [loadingPayment, setLoadingPayment]         = useState(false);
  const [commissions, setCommissions]               = useState<Commission[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  // ── Fetch du projet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) dispatch(fetchProjectById(id));
    return () => { dispatch(clearCurrentProject()); };
  }, [id, dispatch]);

  // ── Gestion des erreurs Redux ────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      if (error.includes('non trouvé') || error.includes('404'))
        setTimeout(() => navigate('/engineer/projects'), 2000);
    }
  }, [error, dispatch, navigate]);

  // ── Chargement des commissions ───────────────────────────────────────────────
  // L'API retourne déjà total_paid et remaining_amount → pas besoin de fetcher
  // les paiements un par un.
  const loadCommissions = async () => {
    if (!project || !canViewSales) return;
    setLoadingCommissions(true);
    try {
      const soldIds = ((project as any).project_solds || []).map((s: any) => s.id);

      // Récupère toutes les pages automatiquement
      const all = await commercialService.getAllCommissionsFlat();

      // Filtre uniquement les commissions de ce projet
      const filtered = all.filter((c: Commission) => soldIds.includes(c.project_sold_id));

      setCommissions(filtered);
    } catch (e) {
      console.error('Erreur chargement commissions:', e);
    } finally {
      setLoadingCommissions(false);
    }
  };

  useEffect(() => {
    if (project) loadCommissions();
  }, [project?.id]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddSold = async (name: string) => {
    if (!project) return;
    setLoadingSold(true);
    try {
      await projectService.addProjectSold(project.id, name);
      toast.success('Vente ajoutée !');
      setIsAddSoldOpen(false);
      if (id) await dispatch(fetchProjectById(id));
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoadingSold(false);
    }
  };

  const handleAcceptProject = async () => {
    if (!project || !id) return;
    try {
      await dispatch(acceptProject(project.id)).unwrap();
      toast.success('Projet accepté !');
      setShowAcceptModal(false);
      await dispatch(fetchProjectById(id));
    } catch (err: any) {
      toast.error(err || 'Erreur');
      setShowAcceptModal(false);
    }
  };

  const handleAddPayment = async (amount: number, note: string) => {
    if (!paymentTarget) return;
    setLoadingPayment(true);
    try {
      await commercialService.createPayment({
        commission_id: paymentTarget.id,
        amount_paid:   amount,
        note:          note || undefined,
      });
      toast.success('Paiement enregistré !');
      setPaymentTarget(null);
      await loadCommissions(); // reload pour mettre à jour total_paid / remaining_amount
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    try {
      await commercialService.deletePayment(paymentId);
      toast.success('Paiement supprimé');
      await loadCommissions();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // ── Utils ─────────────────────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const getExt = (f: string) => f.split('.').pop()?.toUpperCase() || 'FILE';

  const download = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const statusBadge = (s: string) => {
    const labels: Record<string, string> = {
      published: 'Publié', unpublished: 'Non publié',
      completed: 'Terminé', in_progress: 'En cours',
    };
    const dots: Record<string, string> = {
      published: 'bg-green-400', unpublished: 'bg-gray-300',
      completed: 'bg-blue-300',  in_progress: 'bg-amber-400',
    };
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white/20 text-white border-white/30">
        <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || 'bg-gray-300'}`} />
        {labels[s] || s}
      </span>
    );
  };

  // ── Totaux commissions ────────────────────────────────────────────────────────
  const projectSolds    = (project as any)?.project_solds || [];
  const totalCommAmount = commissions.reduce((s, c) => s + commissionTotal(c), 0);
  const totalPaidAll    = commissions.reduce((s, c) => s + commissionPaid(c), 0);
  const totalRemaining  = commissions.reduce((s, c) => s + commissionRemaining(c), 0);

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto" />
        <p className="text-gray-400 text-sm">Chargement du projet...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center space-y-4">
        <div className="p-4 bg-gray-100 rounded-full inline-block">
          <FiFileText className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-700">Projet non trouvé</p>
        <button onClick={() => navigate('/engineer/projects')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          <FiArrowLeft className="h-4 w-4" />Retour
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/engineer/projects')}
          className="flex items-center gap-1.5 hover:text-blue-600 font-medium transition-colors">
          <FiArrowLeft className="h-4 w-4" />Projets
        </button>
        <FiChevronRight className="h-3 w-3" />
        <span className="text-gray-800 font-semibold truncate max-w-xs">{project.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {statusBadge(project.status)}
              {project.accepted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-400/30 text-green-100 border border-green-300/30">
                  <FiCheckCircle className="h-3 w-3" />Accepté
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
              <span className="flex items-center gap-1.5">
                <FiUser className="h-4 w-4" />
                {project.user?.contact?.firstName} {project.user?.contact?.lastName}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar className="h-4 w-4" />{formatDate(project.created_at)}
              </span>
              <code className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-blue-200">
                {project.uuid}
              </code>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            {project.amount && parseFloat(project.amount) > 0 && (
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-right border border-white/20">
                <p className="text-xs text-blue-200 mb-0.5">Montant</p>
                <p className="text-2xl font-bold">
                  {fmt(parseFloat(project.amount))} <span className="text-sm font-normal text-blue-200">FCFA</span>
                </p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap justify-end">
              {canAcceptProject && !project.accepted && (
                <button onClick={() => setShowAcceptModal(true)} disabled={isAccepting}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 disabled:opacity-50 shadow-sm">
                  {isAccepting
                    ? <FiLoader className="animate-spin h-4 w-4" />
                    : <FiCheckCircle className="h-4 w-4" />}
                  Accepter
                </button>
              )}
              {canEditProject && (
                <>
                  <button onClick={() => navigate(`/engineer/projects/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/30">
                    <FiEdit className="h-4 w-4" />Modifier
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Supprimer ce projet ?')) return;
                      toast.success('Supprimé');
                      navigate('/engineer/projects');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white text-sm font-semibold rounded-xl hover:bg-red-500">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiImage className="w-5 h-5 text-purple-600" />}
          label="Images" value={project.images?.length || 0}
          color="text-purple-600" bg="bg-purple-50/50 border-purple-100"
        />
        <StatCard
          icon={<FiFile className="w-5 h-5 text-emerald-600" />}
          label="Fichiers" value={project.files?.length || 0}
          color="text-emerald-600" bg="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard
          icon={<FiZap className="w-5 h-5 text-blue-600" />}
          label="Ventes" value={projectSolds.length}
          color="text-blue-600" bg="bg-blue-50/50 border-blue-100"
        />
        <StatCard
          icon={<FiAward className="w-5 h-5 text-violet-600" />}
          label="Commissions" value={commissions.length}
          sub={
            totalCommAmount > 0
              ? `${fmt(totalPaidAll)} / ${fmt(totalCommAmount)} FCFA versés`
              : undefined
          }
          color="text-violet-600" bg="bg-violet-50/50 border-violet-100"
        />
      </div>

      {/* Grid principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-blue-600" />Description
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Observations */}
          <ProjectObservationsWithAnnotations
            projectId={project.id}
            readOnly={!canAddObservation}
            projectFiles={project.files || []}
            projectImages={project.images || []}
          />

          {/* Images */}
          {project.images && project.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiImage className="w-4 h-4 text-purple-600" />Images
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                  {project.images.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.images.map(img => (
                  <div key={img.id}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-100 hover:border-blue-400 transition-all"
                    onClick={() => setSelectedImage(img.url)}>
                    <img src={img.url} alt=""
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="flex items-center gap-2 text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-lg">
                        <FiEye className="w-4 h-4" />Agrandir
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fichiers */}
          {project.files && project.files.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-emerald-600" />Fichiers
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                  {project.files.length}
                </span>
              </h2>
              <div className="space-y-2">
                {project.files.map(f => (
                  <div key={f.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <div className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold flex-shrink-0">
                      {getExt(f.filename)}
                    </div>
                    <p className="text-sm font-medium text-gray-800 flex-1 truncate">{f.filename}</p>
                    <button onClick={() => download(f.url, f.filename)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-all">
                      <FiDownload className="h-3.5 w-3.5" />Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Montants */}
          {canViewAmounts && project.accepted && (
            <ProjectAmounts
              projectId={project.id}
              currentAmount={project.amount}
              currentAmountToPerceive={(project as any).amount_to_perceive}
              onUpdate={() => dispatch(fetchProjectById(id!))}
            />
          )}

          {/* Commissions */}
          {canViewSales && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-xl">
                    <FiAward className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Commissions</h2>
                    <p className="text-xs text-gray-400">
                      {commissions.length} commission{commissions.length > 1 ? 's' : ''}
                      {totalCommAmount > 0 && (
                        <> — <span className="text-green-600 font-semibold">{fmt(totalPaidAll)} FCFA</span> versés
                        {totalRemaining > 0 && (
                          <> · <span className="text-amber-600 font-semibold">{fmt(totalRemaining)} FCFA</span> restants</>
                        )}</>
                      )}
                    </p>
                  </div>
                </div>
                {canManagePayments && (
                  <button onClick={() => setIsCommissionOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">
                    <FiPlus className="w-3.5 h-3.5" />Nouvelle
                  </button>
                )}
              </div>

              {/* Récap financier */}
              {commissions.length > 0 && totalCommAmount > 0 && (
                <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
                  <div className="bg-white px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Total commissions</p>
                    <p className="text-sm font-bold text-gray-800">{fmt(totalCommAmount)} <span className="text-xs font-normal text-gray-400">FCFA</span></p>
                  </div>
                  <div className="bg-white px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Total versé</p>
                    <p className="text-sm font-bold text-green-700">{fmt(totalPaidAll)} <span className="text-xs font-normal text-green-400">FCFA</span></p>
                  </div>
                  <div className="bg-white px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">Total restant</p>
                    <p className={`text-sm font-bold ${totalRemaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {fmt(totalRemaining)} <span className="text-xs font-normal opacity-60">FCFA</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4">
                {loadingCommissions
                  ? <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                      <FiLoader className="animate-spin w-5 h-5" />
                      <span className="text-sm">Chargement des commissions...</span>
                    </div>
                  : commissions.length === 0
                    ? <div className="flex flex-col items-center py-10 gap-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <FiAward className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Aucune commission pour ce projet</p>
                        {canManagePayments && (
                          <button onClick={() => setIsCommissionOpen(true)}
                            className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                            <FiPlus className="w-3 h-3" />Créer une commission
                          </button>
                        )}
                      </div>
                    : <div className="space-y-3">
                        {commissions.map(c => (
                          <CommissionCard
                            key={c.id}
                            commission={c}
                            canManagePayments={canManagePayments}
                            onAddPayment={setPaymentTarget}
                            onDeletePayment={handleDeletePayment}
                          />
                        ))}
                      </div>}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Créateur */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-blue-600" />Créateur
            </h3>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                {project.user?.contact?.firstName?.[0]}{project.user?.contact?.lastName?.[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  {project.user?.contact?.firstName} {project.user?.contact?.lastName}
                </p>
                <p className="text-xs text-gray-400">Corrector</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <a href={`mailto:${(project.user?.contact as any)?.email}`}
                  className="text-blue-600 text-xs hover:underline truncate block">
                  {(project.user?.contact as any)?.email || 'N/A'}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
                <a href={`tel:${(project.user?.contact as any)?.phoneNumber}`}
                  className="text-blue-600 text-xs hover:underline">
                  {(project.user?.contact as any)?.phoneNumber || 'N/A'}
                </a>
              </div>
            </div>
          </div>

          {/* Statut validation */}
          <div className={`rounded-2xl p-5 border ${project.accepted ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              {project.accepted
                ? <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                : <FiClock className="w-5 h-5 text-amber-600 flex-shrink-0" />}
              <div>
                <p className={`text-sm font-bold ${project.accepted ? 'text-green-800' : 'text-amber-800'}`}>
                  {project.accepted ? 'Projet accepté' : 'En attente de validation'}
                </p>
                <p className={`text-xs mt-0.5 ${project.accepted ? 'text-green-600' : 'text-amber-600'}`}>
                  {project.accepted ? 'Ce projet a été validé' : 'En attente d\'acceptation'}
                </p>
              </div>
            </div>
          </div>

          {/* Ventes */}
          {canViewSales && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-emerald-600" />Ventes
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {projectSolds.length}
                  </span>
                </h3>
                {canAddSale && (
                  <button onClick={() => setIsAddSoldOpen(true)}
                    className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                    <FiPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {projectSolds.length === 0
                ? <div className="px-5 py-6 text-center">
                    <p className="text-xs text-gray-400 mb-2">Aucune vente enregistrée</p>
                    {canAddSale && (
                      <button onClick={() => setIsAddSoldOpen(true)}
                        className="text-xs text-emerald-600 font-semibold hover:underline">
                        + Ajouter une vente
                      </button>
                    )}
                  </div>
                : <div className="divide-y divide-gray-50">
                    {projectSolds.map((s: any, i: number) => (
                      <div key={s.id || i} className="flex items-center gap-3 px-5 py-3">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <FiUser className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{s.customer_of_name}</p>
                          <p className="text-xs text-gray-400">#{s.id}</p>
                        </div>
                        {s.created_at && (
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(s.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>}
            </div>
          )}

          {/* Montant à percevoir */}
          {canViewAmounts && parseFloat((project as any).amount_to_perceive) > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-orange-500" />Montant à percevoir
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {fmt(parseFloat((project as any).amount_to_perceive))}
                <span className="text-sm font-normal text-orange-400"> FCFA</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────────── */}

      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAcceptProject}
        title="Accepter ce projet ?"
        isLoading={isAccepting}
        type="success"
        message={`Voulez-vous accepter le projet "${project?.name}" ?`}
        confirmText="Accepter"
        cancelText="Annuler"
      />

      <AddSoldModal
        isOpen={isAddSoldOpen}
        onClose={() => setIsAddSoldOpen(false)}
        onConfirm={handleAddSold}
        loading={loadingSold}
      />

      <CreateCommissionModal
        isOpen={isCommissionOpen}
        onClose={() => setIsCommissionOpen(false)}
        onCreated={() => { loadCommissions(); if (id) dispatch(fetchProjectById(id)); }}
        projectSolds={projectSolds}
        projectName={project.name}
      />

      {/* Paiement — on passe remaining directement depuis l'API */}
      {paymentTarget && (
        <AddPaymentModal
          isOpen={!!paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onConfirm={handleAddPayment}
          loading={loadingPayment}
          commissionId={paymentTarget.id}
          commissionAmount={commissionTotal(paymentTarget)}
          alreadyPaid={commissionPaid(paymentTarget)}
          remaining={commissionRemaining(paymentTarget)}
        />
      )}

      {/* Lightbox image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <FiX className="h-6 w-6" />
          </button>
          <img src={selectedImage} alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;