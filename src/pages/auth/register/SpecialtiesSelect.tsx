// src/pages/auth/register/SpecialtiesSelect.tsx
import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { getSpecialtiesByAccountType } from '../../../utils/specialties';


interface SpecialtiesSelectProps {
  accountType: string;
  selected: string[];
  onChange: (specialties: string[]) => void;
  error?: string;
}

const SpecialtiesSelect: React.FC<SpecialtiesSelectProps> = ({
  accountType,
  selected,
  onChange,
  error
}) => {
  const availableSpecialties = getSpecialtiesByAccountType(accountType);

  const handleToggle = (specialtyValue: string) => {
    if (selected.includes(specialtyValue)) {
      // Retirer la spécialité
      onChange(selected.filter(s => s !== specialtyValue));
    } else {
      // Ajouter la spécialité
      onChange([...selected, specialtyValue]);
    }
  };

  if (!accountType) {
    return null;
  }

  if (availableSpecialties.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Aucune spécialité disponible pour ce type de compte.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Spécialités *
        <span className="text-xs text-gray-500 ml-2">
          (Sélectionnez au moins une spécialité)
        </span>
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableSpecialties.map((specialty) => {
          const isSelected = selected.includes(specialty.value);
          
          return (
            <button
              key={specialty.value}
              type="button"
              onClick={() => handleToggle(specialty.value)}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                {specialty.label}
              </span>
              
              {isSelected && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiCheck className="text-white" size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Affichage des spécialités sélectionnées */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            {selected.length} spécialité{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''} :
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((value) => {
              const specialty = availableSpecialties.find(s => s.value === value);
              return (
                <span
                  key={value}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                >
                  {specialty?.label || value}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SpecialtiesSelect;