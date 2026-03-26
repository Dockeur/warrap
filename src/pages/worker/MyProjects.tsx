// src/pages/worker/MyProjects.tsx
import React from 'react';

const MyProjects: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Projets</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
          <p className="text-sm text-indigo-700">
             Ici vous verrez tous les projets auxquels vous êtes assigné.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;