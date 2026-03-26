// src/pages/engineer/RateWorker.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar } from 'react-icons/fi';

const RateWorker: React.FC = () => {
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
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Noter le Travailleur</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 flex items-start gap-3">
          <FiStar className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
          <p className="text-sm text-yellow-700">
            Ici vous pourrez évaluer le travail d'un travailleur après la fin d'un projet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateWorker;