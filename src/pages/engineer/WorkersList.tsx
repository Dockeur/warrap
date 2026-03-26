// src/pages/engineer/WorkersList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { FiStar, FiBriefcase, FiSearch, FiFilter } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchWorkers } from '../../features/users/usersSlice';
import { PROFESSIONS, SKILLS } from '../../utils/constants';

const WorkersList: React.FC = () => {
  const dispatch = useAppDispatch();
 const { workers = [], isLoading } = useAppSelector((state) => state.users);

  const [filters, setFilters] = useState({
    profession: '',
    skills: [] as string[],
    minRating: 0,
    searchTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkers());
    
  }, [dispatch]);
  console.log("travailleur", workers);

  const handleSkillToggle = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Filtrer les travailleurs
  const filteredWorkers = workers.filter((worker) => {
    const matchesProfession = !filters.profession || worker.profession === filters.profession;
    const matchesSkills =
      filters.skills.length === 0 ||
      filters.skills.some((skill) => worker.skills.includes(skill));
    const matchesRating = worker.rating >= filters.minRating;
    const matchesSearch =
      !filters.searchTerm ||
      `${worker.firstName} ${worker.lastName} ${worker.profession}`
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());

    return matchesProfession && matchesSkills && matchesRating && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Travailleurs</h1>
        <p className="text-gray-600 mt-2">
          Trouvez les meilleurs professionnels pour vos projets
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom ou métier..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiFilter />
              Filtres
              {(filters.profession || filters.skills.length > 0 || filters.minRating > 0) && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                  {[
                    filters.profession ? 1 : 0,
                    filters.skills.length > 0 ? 1 : 0,
                    filters.minRating > 0 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Métier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Métier
                  </label>
                  <select
                    value={filters.profession}
                    onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les métiers</option>
                    {PROFESSIONS.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note minimale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note minimale
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Toutes les notes</option>
                    <option value="4">4+ étoiles</option>
                    <option value="4.5">4.5+ étoiles</option>
                  </select>
                </div>

                {/* Compétences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compétences ({filters.skills.length} sélectionnée{filters.skills.length > 1 ? 's' : ''})
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {SKILLS.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Réinitialiser les filtres */}
              {(filters.profession || filters.skills.length > 0 || filters.minRating > 0) && (
                <button
                  onClick={() => setFilters({ profession: '', skills: [], minRating: 0, searchTerm: filters.searchTerm })}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredWorkers.length} travailleur{filteredWorkers.length > 1 ? 's' : ''} trouvé{filteredWorkers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des travailleurs */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      ) : filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Link
              key={worker.id}
              to={`/engineer/workers/${worker.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Avatar et nom */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                    {worker.avatar ? (
                      <img
                        src={worker.avatar}
                        alt={`${worker.firstName} ${worker.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <>
                        {worker.firstName[0]}
                        {worker.lastName[0]}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {worker.firstName} {worker.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{worker.profession}</p>
                  </div>
                </div>

                {/* Note et expérience */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {worker.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">({worker.totalRatings})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FiBriefcase className="text-gray-400" />
                    {worker.experience} ans
                  </div>
                </div>

                {/* Compétences */}
                {worker.skills && worker.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{worker.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tarif horaire */}
                {worker.hourlyRate && (
                  <div className="text-sm font-medium text-green-600">
                    {worker.hourlyRate}€/heure
                  </div>
                )}

                {/* Bouton voir profil */}
                <button className="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                  Voir le profil
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg font-medium">Aucun travailleur trouvé</p>
          <p className="text-gray-500 text-sm mt-2">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkersList;