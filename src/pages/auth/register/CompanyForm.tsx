// src/pages/auth/register/CompanyForm.tsx
import React from 'react';
import { FiHome, FiFileText, FiMapPin, FiHash } from 'react-icons/fi';

interface CompanyFormProps {
  data: {
    companyName?: string;
    companyRegistration?: string;
    companyAddress?: string;
    taxNumber?: string;
  };
  onChange: (data: any) => void;
  errors: any;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ data, onChange, errors }) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Informations de l'entreprise
      </h3>

      {/* Nom de l'entreprise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'entreprise *
        </label>
        <div className="relative">
          <FiHome className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Architecture & Design SARL"
          />
        </div>
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
        )}
      </div>

      {/* Numéro d'enregistrement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro d'enregistrement *
        </label>
        <div className="relative">
          <FiFileText className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={data.companyRegistration || ''}
            onChange={(e) => handleChange('companyRegistration', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: CM-DLA-2020-12345"
          />
        </div>
        {errors.companyRegistration && (
          <p className="mt-1 text-sm text-red-600">{errors.companyRegistration}</p>
        )}
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse de l'entreprise
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={data.companyAddress || ''}
            onChange={(e) => handleChange('companyAddress', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 123 Rue des Architectes, Douala"
          />
        </div>
      </div>

      {/* Numéro fiscal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numéro fiscal (Contribuable)
        </label>
        <div className="relative">
          <FiHash className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={data.taxNumber || ''}
            onChange={(e) => handleChange('taxNumber', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: M012345678901234"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;