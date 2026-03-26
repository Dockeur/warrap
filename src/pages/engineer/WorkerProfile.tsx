// src/pages/engineer/WorkerProfile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft />
        Retour
      </button>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil du Travailleur</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-blue-700">
            👤 Ici vous verrez le profil complet d'un travailleur avec toutes ses informations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;