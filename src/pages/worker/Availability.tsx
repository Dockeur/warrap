// src/pages/worker/Availability.tsx
import React from 'react';

const Availability: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Disponibilités</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Page en construction...</p>
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-sm text-green-700">
             Ici vous pourrez gérer vos périodes de disponibilité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Availability;