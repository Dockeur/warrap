// src/pages/auth/AccountTypeCard.tsx
import React from 'react';
import { IconType } from 'react-icons';
import { FiCheck } from 'react-icons/fi';

interface AccountTypeCardProps {
  value: string;
  label: string;
  icon: IconType;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  value,
  label,
  icon: Icon,
  description,
  selected,
  onClick
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-6 rounded-lg border-2 transition-all text-left
        ${selected
          ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-105'
          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
        }
      `}
    >
      {/* Icône de sélection */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <FiCheck className="text-white" size={16} />
        </div>
      )}

      {/* Icône du type de compte */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center mb-3
        ${selected ? 'bg-blue-600' : 'bg-gray-100'}
      `}>
        <Icon 
          className={selected ? 'text-white' : 'text-gray-600'} 
          size={24} 
        />
      </div>

      {/* Label */}
      <h3 className={`
        text-lg font-semibold mb-1
        ${selected ? 'text-blue-900' : 'text-gray-900'}
      `}>
        {label}
      </h3>

      {/* Description */}
      <p className={`
        text-sm
        ${selected ? 'text-blue-700' : 'text-gray-600'}
      `}>
        {description}
      </p>
    </button>
  );
};

export default AccountTypeCard;