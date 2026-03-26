// src/pages/admin/ProjectAmounts.tsx
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiSave, FiEdit2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setProjectAmounts, selectIsUpdating } from '../../features/projects/projectsSlice';

interface ProjectAmountsProps {
  projectId: number;
  currentAmount?: string;
  currentAmountToPerceive?: string;
  onUpdate?: () => void;
}

const ProjectAmounts: React.FC<ProjectAmountsProps> = ({
  projectId,
  currentAmount,
  currentAmountToPerceive,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const isUpdating = useAppSelector(selectIsUpdating);

  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountToPerceive, setAmountToPerceive] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; amountToPerceive?: string }>({});

  // Initialiser avec les valeurs actuelles
  useEffect(() => {
    if (currentAmount) {
      setAmount(currentAmount);
    }
    if (currentAmountToPerceive) {
      setAmountToPerceive(currentAmountToPerceive);
    }
  }, [currentAmount, currentAmountToPerceive]);

  // Vérifier si les montants sont déjà définis
  const hasAmounts = currentAmount && parseFloat(currentAmount) > 0;

  const validate = () => {
    const newErrors: { amount?: string; amountToPerceive?: string } = {};

    const amountNum = parseFloat(amount);
    const amountToPerceiveNum = parseFloat(amountToPerceive);

    if (!amount || amountNum <= 0) {
      newErrors.amount = 'Le montant de vente doit être supérieur à 0';
    }

    if (!amountToPerceive || amountToPerceiveNum <= 0) {
      newErrors.amountToPerceive = 'Le montant à percevoir doit être supérieur à 0';
    }

    if (amountNum > 0 && amountToPerceiveNum > 0 && amountToPerceiveNum > amountNum) {
      newErrors.amountToPerceive = 'Le montant à percevoir ne peut pas être supérieur au montant de vente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await dispatch(
        setProjectAmounts({
          projectId,
          amount: parseFloat(amount),
          amountToPerceive: parseFloat(amountToPerceive),
        })
      ).unwrap();

      toast.success('✅ Montants définis avec succès !');
      setIsEditing(false);

      // Callback pour recharger le projet
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error || 'Erreur lors de la définition des montants');
      console.error('Set amounts error:', error);
    }
  };

  const handleCancel = () => {
    // Réinitialiser avec les valeurs actuelles
    if (currentAmount) setAmount(currentAmount);
    if (currentAmountToPerceive) setAmountToPerceive(currentAmountToPerceive);
    setErrors({});
    setIsEditing(false);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('fr-FR') + ' FCFA';
  };

  const calculateCommission = () => {
    const amountNum = parseFloat(amount) || 0;
    const amountToPerceiveNum = parseFloat(amountToPerceive) || 0;
    const commission = amountNum - amountToPerceiveNum;
    const percentage = amountNum > 0 ? (commission / amountNum) * 100 : 0;
    return { commission, percentage };
  };

  const { commission, percentage } = calculateCommission();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FiDollarSign className="mr-2 h-5 w-5 text-green-600" />
          Définir les montants
        </h2>
        {hasAmounts && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="h-4 w-4" />
            Modifier
          </button>
        )}
      </div>

      {!isEditing && !hasAmounts && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucun montant défini pour ce projet</p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDollarSign className="h-4 w-4" />
            Définir les montants
          </button>
        </div>
      )}

      {!isEditing && hasAmounts && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Prix de vente</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(currentAmount || '0')}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">Montant pour le créateur</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(currentAmountToPerceive || '0')}
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-600 font-medium mb-1">Commission plateforme</p>
            <p className="text-xl font-bold text-orange-700">
              {formatCurrency((parseFloat(currentAmount || '0') - parseFloat(currentAmountToPerceive || '0')).toString())}
              <span className="text-sm font-normal ml-2">
                ({((1 - parseFloat(currentAmountToPerceive || '0') / parseFloat(currentAmount || '1')) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Montant de vente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix de vente sur la plateforme *
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-4 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="150000000"
                step="1000"
                min="0"
                disabled={isUpdating}
              />
              <span className="absolute right-4 top-3 text-gray-500 text-sm">FCFA</span>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Montant auquel le projet sera vendu
            </p>
          </div>

          {/* Montant à percevoir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant pour le créateur *
            </label>
            <div className="relative">
              <input
                type="number"
                value={amountToPerceive}
                onChange={(e) => setAmountToPerceive(e.target.value)}
                className={`w-full pl-4 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amountToPerceive ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100000000"
                step="1000"
                min="0"
                disabled={isUpdating}
              />
              <span className="absolute right-4 top-3 text-gray-500 text-sm">FCFA</span>
            </div>
            {errors.amountToPerceive && (
              <p className="mt-1 text-sm text-red-600">{errors.amountToPerceive}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Montant que le créateur recevra
            </p>
          </div>

          {/* Aperçu de la commission */}
          {amount && amountToPerceive && !errors.amount && !errors.amountToPerceive && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Commission plateforme:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(commission)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pourcentage:</span>
                <span className="font-semibold text-gray-700">
                  {percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiX className="h-4 w-4" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProjectAmounts;