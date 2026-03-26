import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Edit2, XCircle, UserPlus, Eye, EyeOff, CheckCircle, Clock, UserCheck } from 'lucide-react';
import { FiLayers, FiPlus, FiChevronDown, FiChevronRight, FiTag, FiLoader, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import usersService, {
  AdminUser,
  CreateUserPayload,
  Lot,
  AccountRequest,
  AccountStatus,
} from '../../features/users/usersService';

const ROLES = [
  { value: 'admin',     label: 'Administrateur', bg: 'bg-red-100',    text: 'text-red-800'    },
  { value: 'validator', label: 'Validateur',      bg: 'bg-purple-100', text: 'text-purple-800' },
  { value: 'corrector', label: 'Correcteur',      bg: 'bg-blue-100',   text: 'text-blue-800'   },
  { value: 'user',      label: 'Utilisateur',     bg: 'bg-gray-100',   text: 'text-gray-800'   },
];

const getRoleMeta = (role: string) =>
  ROLES.find(r => r.value === role) ?? { label: role, bg: 'bg-gray-100', text: 'text-gray-800' };

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const m = getRoleMeta(role);
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
};

const ACCOUNT_STATUS_TABS: { value: AccountStatus | ''; label: string; color: string; dot: string }[] = [
  { value: 'pending',  label: 'En attente', color: 'text-amber-600', dot: 'bg-amber-400' },
  { value: 'accepted', label: 'Acceptés',   color: 'text-green-600', dot: 'bg-green-400' },
  { value: 'rejected', label: 'Refusés',    color: 'text-red-600',   dot: 'bg-red-400'   },
  { value: '',         label: 'Tous',       color: 'text-gray-600',  dot: 'bg-gray-400'  },
];

const AccountStatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
  const map: Record<AccountStatus, { label: string; bg: string; text: string }> = {
    pending:  { label: 'En attente', bg: 'bg-amber-100', text: 'text-amber-700' },
    accepted: { label: 'Accepté',    bg: 'bg-green-100', text: 'text-green-700' },
    rejected: { label: 'Refusé',     bg: 'bg-red-100',   text: 'text-red-700'   },
  };
  const m = map[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
};

const RoleModal: React.FC<{
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ user, isOpen, onClose, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) setSelectedRole(user.role); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await usersService.updateUserRole(user.id, { role: selectedRole });
      toast.success('Rôle mis à jour avec succès');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
    } finally { setLoading(false); }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-900">Modifier le rôle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-5 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {user.profile ? (
              <img src={user.profile} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {((user.contact?.firstName?.[0] || '') + (user.contact?.lastName?.[0] || '')) || user.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {[user.contact?.firstName, user.contact?.lastName].filter(Boolean).join(' ') || user.email}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau rôle</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un rôle</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState<CreateUserPayload>({
    email: '', password: '', password_confirmation: '',
    firstName: '', lastName: '', phoneNumber: '', role: 'validator',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof CreateUserPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await usersService.createAdminUser(form);
      toast.success('Utilisateur créé avec succès');
      onCreated();
      onClose();
      setForm({ email: '', password: '', password_confirmation: '', firstName: '', lastName: '', phoneNumber: '', role: 'validator' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const Field = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof CreateUserPayload; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[field] as string} onChange={set(field)}
        placeholder={placeholder} required
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Créer un utilisateur</h3>
            <p className="text-sm text-gray-500 mt-0.5">Admin, Validateur ou Correcteur</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom *" field="firstName" placeholder="Marie" />
            <Field label="Nom *" field="lastName" placeholder="Dupont" />
          </div>
          <Field label="Email *" field="email" type="email" placeholder="marie@example.com" />
          <Field label="Téléphone *" field="phoneNumber" placeholder="+237698765432" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select value={form.role} onChange={set('role')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
              {ROLES.filter(r => ['admin', 'validator', 'corrector'].includes(r.value)).map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={set('password')} required placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer *</label>
            <input type={showPwd ? 'text' : 'password'} value={form.password_confirmation}
              onChange={set('password_confirmation')} required placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
              {loading ? 'Création...' : <><UserPlus className="w-4 h-4" /> Créer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmActionModal: React.FC<{
  account: AccountRequest | null;
  action: 'accepted' | 'rejected' | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ account, action, onConfirm, onCancel }) => {
  if (!account || !action) return null;

  const isAccept = action === 'accepted';
  const fullName = [account.contact?.firstName, account.contact?.lastName].filter(Boolean).join(' ') || account.email;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${isAccept ? 'bg-green-100' : 'bg-red-100'}`}>
          {isAccept
            ? <CheckCircle className="w-7 h-7 text-green-600" />
            : <XCircle className="w-7 h-7 text-red-600" />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
          {isAccept ? 'Accepter ce compte ?' : 'Refuser ce compte ?'}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isAccept
            ? <>Le compte de <span className="font-semibold text-gray-700">{fullName}</span> sera activé.</>
            : <>La demande de <span className="font-semibold text-gray-700">{fullName}</span> sera rejetée.</>}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
            Annuler
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium text-sm ${isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isAccept ? 'Accepter' : 'Refuser'}
          </button>
        </div>
      </div>
    </div>
  );
};

const buildTree = (lots: Lot[]): Lot[] =>
  lots
    .filter(l => l.role === 'main')
    .map(m => ({ ...m, children: lots.filter(c => c.role === 'child' && c.main_id === m.id) }));

const AddLotModal: React.FC<{
  isOpen: boolean;
  mode: 'main' | 'child';
  parentLot?: Lot | null;
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, mode, parentLot, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) setName(''); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload = mode === 'main'
        ? { name: name.trim(), role: 'main' as const }
        : { name: name.trim(), role: 'child' as const, main_id: parentLot!.id };
      await usersService.createLot(payload);
      toast.success(mode === 'main' ? 'Lot principal créé' : 'Sous-lot créé');
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {mode === 'main' ? 'Nouveau lot principal' : 'Nouveau sous-lot'}
            </h3>
            {mode === 'child' && parentLot && (
              <p className="text-sm text-gray-500 mt-0.5">
                Rattaché à : <span className="font-semibold capitalize">{parentLot.name}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du {mode === 'main' ? 'lot' : 'sous-lot'} *
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={mode === 'main' ? 'Ex : Électricité' : 'Ex : Tableau électrique'}
              required autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
              Annuler
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2">
              {loading ? <><FiLoader className="animate-spin h-4 w-4" /> Création...</> : <><FiCheck className="h-4 w-4" /> Créer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MainLotCard: React.FC<{ lot: Lot; onAddChild: (lot: Lot) => void }> = ({ lot, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const children = lot.children ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-3 flex-1 text-left">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FiLayers className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 capitalize text-sm">{lot.name}</p>
            <p className="text-xs text-gray-400">{children.length} sous-lot{children.length !== 1 ? 's' : ''}</p>
          </div>
          <span className="ml-1 text-gray-400">
            {expanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
          </span>
        </button>
        <button onClick={() => onAddChild(lot)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all ml-3">
          <FiPlus className="h-3 w-3" /> Sous-lot
        </button>
      </div>

      {expanded && (
        <div className="p-4">
          {children.length === 0 ? (
            <div className="text-center py-5 border-2 border-dashed border-gray-200 rounded-lg">
              <FiTag className="h-6 w-6 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400 mb-1">Aucun sous-lot</p>
              <button onClick={() => onAddChild(lot)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                + Ajouter le premier
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {children.map(child => (
                <div key={child.id}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 capitalize flex-1">{child.name}</span>
                  <span className="text-xs text-gray-400 font-mono">#{child.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [accounts, setAccounts] = useState<AccountRequest[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLastPage, setAccountsLastPage] = useState(1);
  const [accountsPage, setAccountsPage] = useState(1);
  const [accountStatusFilter, setAccountStatusFilter] = useState<AccountStatus | ''>('pending');
  const [accountSearch, setAccountSearch] = useState('');
  const [accountSearchInput, setAccountSearchInput] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    account: AccountRequest | null;
    action: 'accepted' | 'rejected' | null;
  }>({ account: null, action: null });

  const [lots, setLots] = useState<Lot[]>([]);
  const [lotsTree, setLotsTree] = useState<Lot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [lotSearch, setLotSearch] = useState('');
  const [lotModal, setLotModal] = useState<{ open: boolean; mode: 'main' | 'child'; parentLot: Lot | null }>({
    open: false, mode: 'main', parentLot: null,
  });

  useEffect(() => { fetchUsers(); fetchLots(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(u => {
        const matchSearch =
          !q ||
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.contact?.firstName ?? '').toLowerCase().includes(q) ||
          (u.contact?.lastName ?? '').toLowerCase().includes(q);
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
      })
    );
  }, [searchQuery, roleFilter, users]);

  useEffect(() => {
    fetchAccounts();
  }, [accountStatusFilter, accountSearch, accountsPage]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await usersService.getAdminUsers();
      setUsers(data);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally { setLoadingUsers(false); }
  };

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await usersService.getAccounts({
        status:  accountStatusFilter || undefined,
        name:    accountSearch || undefined,
        perPage: 10,
        page:    accountsPage,
      });
      setAccounts(res.data);
      setAccountsTotal(res.total);
      setAccountsLastPage(res.lastPage);
    } catch {
      toast.error('Erreur lors du chargement des comptes');
    } finally { setLoadingAccounts(false); }
  }, [accountStatusFilter, accountSearch, accountsPage]);

  const fetchLots = async () => {
    setLoadingLots(true);
    try {
      const data = await usersService.getLots();
      setLots(data);
      setLotsTree(buildTree(data));
    } catch {
      toast.error('Erreur lors du chargement des lots');
    } finally { setLoadingLots(false); }
  };

  const handleAccountAction = (account: AccountRequest, action: 'accepted' | 'rejected') => {
    setConfirmModal({ account, action });
  };

  const confirmAccountAction = async () => {
    const { account, action } = confirmModal;
    if (!account || !action) return;
    setActionLoading(account.id);
    setConfirmModal({ account: null, action: null });
    try {
      await usersService.updateAccountStatus(account.id, action);
      toast.success(action === 'accepted' ? 'Compte accepté avec succès' : 'Compte refusé');
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du statut");
    } finally { setActionLoading(null); }
  };

  const handleAccountSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountsPage(1);
    setAccountSearch(accountSearchInput);
  };

  const handleStatusTab = (val: AccountStatus | '') => {
    setAccountStatusFilter(val);
    setAccountsPage(1);
  };

  const userStats = {
    total:      users.length,
    admins:     users.filter(u => u.role === 'admin').length,
    validators: users.filter(u => u.role === 'validator').length,
    correctors: users.filter(u => u.role === 'corrector').length,
  };

  const filteredLotsTree = lotSearch.trim()
    ? lotsTree.filter(m =>
        m.name.toLowerCase().includes(lotSearch.toLowerCase()) ||
        m.children?.some(c => c.name.toLowerCase().includes(lotSearch.toLowerCase()))
      )
    : lotsTree;

  const lotStats = {
    mains:    lotsTree.length,
    children: lots.filter(l => l.role === 'child').length,
    total:    lots.length,
  };

  const pendingCount = accountStatusFilter === 'pending' ? accountsTotal : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <section>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Users className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              </div>
              <p className="text-gray-500 text-sm">Gérer les rôles et permissions</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm">
              <UserPlus className="w-4 h-4" /> Créer un utilisateur
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total',       value: userStats.total,      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'     },
              { label: 'Admins',      value: userStats.admins,     color: 'text-red-600',    bg: 'bg-red-50 border-red-100'       },
              { label: 'Validateurs', value: userStats.validators, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
              { label: 'Correcteurs', value: userStats.correctors, color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-100'     },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Rechercher par nom, email..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]">
              <option value="">Tous les rôles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loadingUsers ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Utilisateur', 'Email', 'Rôle', 'Type de compte', "Date d'inscription", 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(user => {
                      const firstName = user.contact?.firstName || '';
                      const lastName  = user.contact?.lastName  || '';
                      const phone     = user.contact?.phoneNumber || '';
                      const initials  = ((firstName[0] || '') + (lastName[0] || '')) || (user.email?.[0]?.toUpperCase() ?? '?');
                      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || user.email;
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {user.profile ? (
                                <img src={user.profile} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                                {phone && <p className="text-xs text-gray-400">{phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">{user.email}</td>
                          <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                          <td className="px-5 py-4">
                            {user.account_type?.worker
                              ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{user.account_type.worker}</span>
                              : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => { setSelectedUser(user); setIsRoleModalOpen(true); }}
                              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                              <Edit2 className="w-3.5 h-3.5" /> Modifier le rôle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400 text-right">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} affiché{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </section>

        <section>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <UserCheck className="w-7 h-7 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Demandes de comptes</h2>
                {pendingCount !== null && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">Accepter ou refuser les demandes d'accès travailleurs</p>
            </div>
          </div>

          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-4 w-fit shadow-sm">
            {ACCOUNT_STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleStatusTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  accountStatusFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${accountStatusFilter === tab.value ? 'bg-white/70' : tab.dot}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAccountSearchSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={accountSearchInput}
                onChange={e => setAccountSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Rechercher
            </button>
            {accountSearch && (
              <button type="button"
                onClick={() => { setAccountSearchInput(''); setAccountSearch(''); setAccountsPage(1); }}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Effacer
              </button>
            )}
          </form>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loadingAccounts ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chargement des demandes...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">Aucune demande trouvée</p>
                <p className="text-gray-400 text-xs mt-1">
                  {accountSearch ? `Aucun résultat pour "${accountSearch}"` : 'Aucune demande dans cette catégorie'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Travailleur', 'Email', 'Métier', 'Statut', 'Date de demande', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accounts.map(account => {
                      const firstName = account.contact?.firstName || '';
                      const lastName  = account.contact?.lastName  || '';
                      const initials  = ((firstName[0] || '') + (lastName[0] || '')) || (account.email?.[0]?.toUpperCase() ?? '?');
                      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || account.email;
                      const isLoading = actionLoading === account.id;

                      return (
                        <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {account.profile ? (
                                <img src={account.profile} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                                {account.contact?.phoneNumber && (
                                  <p className="text-xs text-gray-400">{account.contact.phoneNumber}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">{account.email}</td>
                          <td className="px-5 py-4">
                            {account.account_type?.worker
                              ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{account.account_type.worker}</span>
                              : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <AccountStatusBadge status={account.account_status} />
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {account.created_at ? new Date(account.created_at).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            {account.account_status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                {isLoading ? (
                                  <FiLoader className="animate-spin h-5 w-5 text-gray-400" />
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAccountAction(account, 'accepted')}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-lg transition-all">
                                      <FiCheck className="w-3.5 h-3.5" /> Accepter
                                    </button>
                                    <button
                                      onClick={() => handleAccountAction(account, 'rejected')}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all">
                                      <FiX className="w-3.5 h-3.5" /> Refuser
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Traité</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {accountsLastPage > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {accountsTotal} demande{accountsTotal !== 1 ? 's' : ''} · page {accountsPage} / {accountsLastPage}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAccountsPage(p => Math.max(1, p - 1))}
                  disabled={accountsPage <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  ← Précédent
                </button>
                {Array.from({ length: accountsLastPage }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === accountsLastPage || Math.abs(p - accountsPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
                    ) : (
                      <button key={p}
                        onClick={() => setAccountsPage(p as number)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          accountsPage === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}>
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setAccountsPage(p => Math.min(accountsLastPage, p + 1))}
                  disabled={accountsPage >= accountsLastPage}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {!loadingAccounts && accountsLastPage <= 1 && (
            <p className="mt-2 text-xs text-gray-400 text-right">
              {accountsTotal} demande{accountsTotal !== 1 ? 's' : ''} affichée{accountsTotal !== 1 ? 's' : ''}
            </p>
          )}
        </section>

        <section>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FiLayers className="w-7 h-7 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Gestion des lots</h2>
              </div>
              <p className="text-gray-500 text-sm">Catégories et sous-catégories de travaux</p>
            </div>
            <button onClick={() => setLotModal({ open: true, mode: 'main', parentLot: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm">
              <FiPlus className="h-4 w-4" /> Nouveau lot principal
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Lots principaux', value: lotStats.mains,    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'     },
              { label: 'Sous-lots',       value: lotStats.children, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
              { label: 'Total',           value: lotStats.total,    color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200'     },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input type="text" placeholder="Rechercher un lot..."
                value={lotSearch} onChange={e => setLotSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
          </div>

          {loadingLots ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FiLoader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chargement des lots...</p>
            </div>
          ) : filteredLotsTree.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FiLayers className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">Aucun lot</h3>
              <p className="text-gray-500 text-sm mb-5">
                {lotSearch ? 'Aucun résultat pour cette recherche' : 'Commencez par créer un lot principal'}
              </p>
              {!lotSearch && (
                <button onClick={() => setLotModal({ open: true, mode: 'main', parentLot: null })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  <FiPlus className="h-4 w-4" /> Créer un lot principal
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLotsTree.map(lot => (
                <MainLotCard
                  key={lot.id}
                  lot={lot}
                  onAddChild={l => setLotModal({ open: true, mode: 'child', parentLot: l })}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      <RoleModal
        user={selectedUser}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onUpdate={fetchUsers}
      />
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchUsers}
      />
      <AddLotModal
        isOpen={lotModal.open}
        mode={lotModal.mode}
        parentLot={lotModal.parentLot}
        onClose={() => setLotModal(m => ({ ...m, open: false }))}
        onCreated={fetchLots}
      />
      <ConfirmActionModal
        account={confirmModal.account}
        action={confirmModal.action}
        onConfirm={confirmAccountAction}
        onCancel={() => setConfirmModal({ account: null, action: null })}
      />
    </div>
  );
};

export default UserManagement;