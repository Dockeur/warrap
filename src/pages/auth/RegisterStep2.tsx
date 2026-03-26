// src/pages/auth/RegisterStep2.tsx
import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

interface RegisterStep2Props {
  onComplete: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

const RegisterStep2: React.FC<RegisterStep2Props> = ({ onComplete, onBack, initialData }) => {
  const [formData, setFormData] = useState({
    // acceptTerms: initialData.acceptTerms || false,
    privacy_policy: initialData.privacy_policy || false,
    // acceptDataProcessing: initialData.acceptDataProcessing || false,
  });

  const allAccepted = formData.privacy_policy ;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allAccepted) {
      onComplete(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Conditions d'utilisation</h2>
      <p className="text-gray-600 mb-8">Veuillez lire et accepter nos conditions</p>

      {/* Terms */}
      {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              J'accepte les conditions générales d'utilisation
            </span>
            <p className="text-sm text-gray-600 mt-1">
              En créant un compte, vous acceptez nos conditions générales d'utilisation.
              {' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Lire les CGU
              </a>
            </p>
          </div>
        </label>
      </div> */}

      {/* Privacy */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacy_policy}
            onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.checked })}
            className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              J'accepte la politique de confidentialité
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Nous respectons votre vie privée et protégeons vos données personnelles.
              {' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                Lire la politique
              </a>
            </p>
          </div>
        </label>
      </div>

      {/* Data Processing */}
      {/* <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptDataProcessing}
            onChange={(e) => setFormData({ ...formData, acceptDataProcessing: e.target.checked })}
            className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              J'accepte le traitement de mes données personnelles
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Vos données seront utilisées uniquement dans le cadre de la plateforme et ne seront jamais vendues.
            </p>
          </div>
        </label>
      </div> */}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          ← Retour
        </button>
        <button
          type="submit"
          disabled={!allAccepted}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continuer →
        </button>
      </div>
    </form>
  );
};

export default RegisterStep2;