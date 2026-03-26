// src/pages/admin/LotsManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  FiLayers, FiPlus, FiChevronDown, FiChevronRight,
  FiTag, FiAlertCircle, FiLoader, FiCheck,
} from 'react-icons/fi';
import { XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import usersService, { Lot } from '../../features/users/usersService';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Regroupe les lots : main lot + leurs enfants */
const buildTree = (lots: Lot[]): Lot[] => {
  const mains  = lots.filter(l => l.role === 'main');
  const childs = lots.filter(l => l.role === 'child');
  return mains.map(m => ({
    ...m,
    children: childs.filter(c => c.main_id === m.id),
  }));
};

// ─── MODAL AJOUTER LOT ───────────────────────────────────────────────────────

const AddLotModal: React.FC<{
  isOpen: boolean;
  mode: 'main' | 'child';        // ce qu'on crée
  parentLot?: Lot | null;        // renseigné uniquement si mode === 'child'
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, mode, parentLot, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload =
        mode === 'main'
          ? { name: name.trim(), role: 'main' as const }
          : { name: name.trim(), role: 'child' as const, main_id: parentLot!.id };

      await usersService.createLot(payload);
      toast.success(mode === 'main' ? 'Lot principal créé' : 'Sous-lot créé');
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
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
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={mode === 'main' ? 'Ex : Électricité' : 'Ex : Tableau électrique'}
              required
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              Annuler
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2">
              {loading
                ? <><FiLoader className="animate-spin h-4 w-4" /> Création...</>
                : <><FiCheck className="h-4 w-4" /> Créer</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── CARD LOT PRINCIPAL ───────────────────────────────────────────────────────

const MainLotCard: React.FC<{
  lot: Lot;
  onAddChild: (lot: Lot) => void;
}> = ({ lot, onAddChild }) => {
  const [expanded, setExpanded] = useState(true);
  const children = lot.children ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* En-tête lot principal */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiLayers className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 capitalize">{lot.name}</p>
            <p className="text-xs text-gray-500">
              {children.length} sous-lot{children.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="ml-2 text-gray-400">
            {expanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
          </span>
        </button>

        {/* Bouton ajouter sous-lot */}
        <button
          onClick={() => onAddChild(lot)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all ml-3"
          title="Ajouter un sous-lot"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Sous-lot
        </button>
      </div>

      {/* Liste des sous-lots */}
      {expanded && (
        <div className="p-4">
          {children.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
              <FiTag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun sous-lot</p>
              <button
                onClick={() => onAddChild(lot)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Ajouter le premier sous-lot
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map(child => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 capitalize flex-1">{child.name}</span>
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

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const LotsManagement: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [tree, setTree] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    mode: 'main' | 'child';
    parentLot: Lot | null;
  }>({ open: false, mode: 'main', parentLot: null });

  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await usersService.getLots();
      setLots(data);
      setTree(buildTree(data));
    } catch (error: any) {
      toast.error('Erreur lors du chargement des lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLots(); }, []);

  const openAddMain  = () => setModal({ open: true, mode: 'main',  parentLot: null });
  const openAddChild = (lot: Lot) => setModal({ open: true, mode: 'child', parentLot: lot });
  const closeModal   = () => setModal(m => ({ ...m, open: false }));

  // Filtrage
  const filteredTree = searchQuery.trim()
    ? tree.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.children?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tree;

  const stats = {
    mains:    tree.length,
    children: lots.filter(l => l.role === 'child').length,
    total:    lots.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FiLayers className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Gestion des lots</h1>
            </div>
            <p className="text-gray-500">Gérer les catégories et sous-catégories de travaux</p>
          </div>
          <button
            onClick={openAddMain}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <FiPlus className="h-4 w-4" />
            Nouveau lot principal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Lots principaux', value: stats.mains,    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'   },
            { label: 'Sous-lots',       value: stats.children, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200'},
            { label: 'Total',           value: stats.total,    color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200'   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un lot..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-16">
            <FiLoader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Chargement des lots...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FiLayers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun lot</h3>
            <p className="text-gray-500 mb-6 text-sm">
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Commencez par créer votre premier lot principal'}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddMain}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <FiPlus className="h-4 w-4" /> Créer un lot principal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTree.map(lot => (
              <MainLotCard
                key={lot.id}
                lot={lot}
                onAddChild={openAddChild}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AddLotModal
        isOpen={modal.open}
        mode={modal.mode}
        parentLot={modal.parentLot}
        onClose={closeModal}
        onCreated={fetchLots}
      />
    </div>
  );
};

export default LotsManagement;