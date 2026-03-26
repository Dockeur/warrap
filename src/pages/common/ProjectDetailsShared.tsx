// src/pages/common/ProjectDetailsShared.tsx
import React from 'react';

const ProjectDetailsShared: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Détails du Projet</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-sm text-yellow-700">
            💡 Cette page affichera les détails complets d'un projet (accessible aux deux rôles).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsShared;