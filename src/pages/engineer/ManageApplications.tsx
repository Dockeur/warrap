// src/pages/engineer/ManageApplications.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const ManageApplications: React.FC = () => {
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
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gérer les Candidatures</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4">
          <p className="text-sm text-cyan-700">
             Ici vous pourrez accepter ou rejeter les candidatures pour un projet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;