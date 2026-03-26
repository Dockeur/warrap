// src/pages/auth/register/LotsSelect.tsx
import React, { useEffect, useState } from 'react';
import { FiLoader, FiCheck, FiX } from 'react-icons/fi';
import lotsService, { Lot } from '../../../features/auth/lotsService';

// ─────────────────────────────────────────────────────────────────────────────
// MODE SIMPLE  → selected: number | null,  onChange: (id: number | null) => void
// MODE MULTI   → selected: number[],       onChange: (ids: number[]) => void
// ─────────────────────────────────────────────────────────────────────────────

type SingleProps = {
  multiple?: false;
  selected: number | null;
  onChange: (lotId: number | null) => void;
  error?: string;
};

type MultiProps = {
  multiple: true;
  selected: number[];
  onChange: (lotIds: number[]) => void;
  error?: string;
};

type LotsSelectProps = (SingleProps | MultiProps) & {
  selectedMainLotName: string;
};

const LotsSelect: React.FC<LotsSelectProps> = (props) => {
  const { selectedMainLotName, error } = props;
  const isMulti = props.multiple === true;

  const [childLots, setChildLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMainLotName) fetchChildLots();
  }, [selectedMainLotName]);

  const fetchChildLots = async () => {
    setIsLoading(true);
    setLoadError(null);
    setChildLots([]);
    // reset selection
    if (isMulti) {
      (props as MultiProps).onChange([]);
    } else {
      (props as SingleProps).onChange(null);
    }
    try {
      const data = await lotsService.getChildLots(selectedMainLotName);
      setChildLots(data);
    } catch (err: any) {
      setLoadError(err.message || 'Impossible de charger les lots');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    (props as SingleProps).onChange(val ? Number(val) : null);
  };

  const toggleMulti = (id: number) => {
    const current = (props as MultiProps).selected;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    (props as MultiProps).onChange(next);
  };

  const removeMulti = (id: number) => {
    const current = (props as MultiProps).selected;
    (props as MultiProps).onChange(current.filter((x) => x !== id));
  };

  // ── Loading / Error / Empty ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <FiLoader className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" />
        <span className="text-sm text-gray-600">
          Chargement des lots pour{' '}
          <span className="font-semibold capitalize">{selectedMainLotName}</span>...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">{loadError}</p>
        <button
          type="button"
          onClick={fetchChildLots}
          className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (childLots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">Aucun lot disponible pour cette catégorie.</p>
      </div>
    );
  }

  // ── Mode simple ────────────────────────────────────────────────────────────

  if (!isMulti) {
    const { selected } = props as SingleProps;
    return (
      <div>
        <label htmlFor="lotSelect" className="block text-sm font-medium text-gray-700 mb-1">
          Lot <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-1">
            — spécialités de{' '}
            <span className="font-semibold capitalize">{selectedMainLotName}</span>
          </span>
        </label>
        <select
          id="lotSelect"
          value={selected ?? ''}
          onChange={handleSingleChange}
          className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-800 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          <option value="">-- Sélectionnez un lot --</option>
          {childLots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.name.charAt(0).toUpperCase() + lot.name.slice(1)}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ── Mode multi (entreprise) ────────────────────────────────────────────────

  const { selected: selectedIds } = props as MultiProps;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Lots <span className="text-red-500">*</span>
        <span className="text-xs text-gray-500 ml-1">
          — spécialités de{' '}
          <span className="font-semibold capitalize">{selectedMainLotName}</span>
          {' '}<span className="text-blue-600 font-semibold">(plusieurs choix possibles)</span>
        </span>
      </label>

      {/* Tags des lots sélectionnés */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          {selectedIds.map((id) => {
            const lot = childLots.find((l) => l.id === id);
            if (!lot) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full"
              >
                <FiCheck className="w-3 h-3" />
                {lot.name.charAt(0).toUpperCase() + lot.name.slice(1)}
                <button
                  type="button"
                  onClick={() => removeMulti(id)}
                  className="ml-0.5 hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                  aria-label="Retirer ce lot"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <span className="text-xs text-blue-700 self-center font-medium">
            {selectedIds.length} lot{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Grille de checkboxes */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-lg bg-white max-h-56 overflow-y-auto ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        {childLots.map((lot) => {
          const isChecked = selectedIds.includes(lot.id);
          return (
            <button
              key={lot.id}
              type="button"
              onClick={() => toggleMulti(lot.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                isChecked
                  ? 'bg-blue-50 border-blue-400 text-blue-800 font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
              >
                {isChecked && <FiCheck className="w-2.5 h-2.5 text-white" />}
              </span>
              {lot.name.charAt(0).toUpperCase() + lot.name.slice(1)}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {selectedIds.length === 0 && (
        <p className="mt-1 text-xs text-gray-400">
          Cliquez sur les lots correspondant aux activités de votre entreprise
        </p>
      )}
    </div>
  );
};

export default LotsSelect;