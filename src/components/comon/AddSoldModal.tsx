// src/components/common/AddSoldModal.tsx
import React, { useState } from 'react';
import { FiX, FiUser } from 'react-icons/fi';

interface AddSoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string) => Promise<void>;
  loading: boolean;
}

const AddSoldModal: React.FC<AddSoldModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError('Le nom du client est requis');
      return;
    }

    if (customerName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    try {
      await onConfirm(customerName.trim());
      setCustomerName('');
      setError('');
    } catch (err) {
      // Géré dans le parent
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCustomerName('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiUser className="h-5 w-5 text-green-600" />
            Ajouter une Vente
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du Client *
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setError('');
              }}
              disabled={loading}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Ex: Jean Dupont"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Le nom du client qui achète ce projet
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !customerName.trim()}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Ajout...</span>
                </>
              ) : (
                <>
                  <FiUser className="h-4 w-4" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSoldModal;