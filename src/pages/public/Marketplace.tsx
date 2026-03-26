// src/pages/public/Marketplace.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiCalendar, FiEye, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import Pagination from '../common/Pagination';
import { PaginationInfo, PublicProject } from '../../types';




const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0,
    has_more: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>(
    (searchParams.get('price') as any) || 'all'
  );

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    fetchProjects(page);
  }, [searchParams]);

  const fetchProjects = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      // Construire l'URL avec les paramètres
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      const response = await axios.get(`${API_URL}/public/projects?${params.toString()}`);
      const data = response.data;

      setProjects(data.data || []);
      
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des projets');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery, page: '1' });
  };

  const handlePriceChange = (newPriceRange: typeof priceRange) => {
    setPriceRange(newPriceRange);
    updateSearchParams({ price: newPriceRange, page: '1' });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const filterProjectsByPrice = (projectsList: PublicProject[]) => {
    if (priceRange === 'all') return projectsList;

    return projectsList.filter((p) => {
      const price = parseFloat(p.amount);
      if (priceRange === 'low') return price < 50000000;
      if (priceRange === 'medium') return price >= 50000000 && price < 150000000;
      if (priceRange === 'high') return price >= 150000000;
      return true;
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/marketplace/project/${projectId}`);
  };

  const filteredProjects = filterProjectsByPrice(projects);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft />
                <span className="font-medium">Retour</span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <h1 className="text-2xl font-bold text-blue-600">EFFICACE</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-lg text-gray-600">
            Découvrez nos projets validés et prêts à être achetés
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={priceRange}
                onChange={(e) => handlePriceChange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les prix</option>
                <option value="low">Moins de 50M FCFA</option>
                <option value="medium">50M - 150M FCFA</option>
                <option value="high">Plus de 150M FCFA</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <FiMapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun projet disponible pour le moment'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateSearchParams({ q: '', page: '1' });
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-gray-600">
                {pagination.total} projet{pagination.total > 1 ? 's' : ''} trouvé
                {pagination.total > 1 ? 's' : ''}
              </div>
              {priceRange !== 'all' && (
                <button
                  onClick={() => handlePriceChange('all')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden border border-gray-200"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0].url}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FiMapPin className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Validé
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {project.description}
                    </p>

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiCalendar className="h-4 w-4" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Prix</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(project.amount)}
                          <span className="text-sm font-normal text-gray-500 ml-1">FCFA</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <FiEye className="h-4 w-4" />
                        <span>Voir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {priceRange === 'all' && (
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                perPage={pagination.per_page}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;