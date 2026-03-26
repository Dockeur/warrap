// src/pages/public/PublicProjectDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiImage,
  FiFile,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PublicProject } from '../../types';



const PublicProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${API_URL}/public/projects/${id}`);
      const data = response.data.data || response.data;
      setProject(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Projet non trouvé');
      navigate('/marketplace');
    } finally {
      setIsLoading(false);
    }
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

  const handlePurchase = () => {
    navigate(`/login?redirect=/marketplace/project/${id}&action=purchase`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Projet non trouvé</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft />
                <span className="font-medium">Marketplace</span>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FiCheckCircle className="h-3 w-3 mr-1" />
                  Validé
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4" />
                  <span>{formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Images */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiImage className="mr-2 h-5 w-5 text-blue-600" />
                  Images ({project.images.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => setSelectedImage(image.url)}
                      className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
                    >
                      <img
                        src={image.url}
                        alt={`Image ${image.id}`}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">Cliquer pour agrandir</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Info */}
            {project.files && project.files.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiFile className="mr-2 h-5 w-5 text-blue-600" />
                  Fichiers Inclus ({project.files.length})
                </h2>
                <p className="text-gray-600 mb-4">
                  Ce projet inclut {project.files.length} fichier
                  {project.files.length > 1 ? 's' : ''} que vous pourrez télécharger après
                  l'achat.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <FiCheckCircle className="inline mr-2" />
                    Connectez-vous pour voir et télécharger tous les fichiers
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Prix du projet</div>
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {formatPrice(project.amount)}
                  <span className="text-lg font-normal text-gray-600 ml-2">FCFA</span>
                </div>
                <div className="text-sm text-gray-500">Paiement sécurisé</div>
              </div>

              {/* CTA */}
              <button
                onClick={handlePurchase}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 mb-4 shadow-lg hover:shadow-xl"
              >
                <FiShoppingCart className="h-5 w-5" />
                Acheter ce Projet
              </button>

              <div className="text-center text-sm text-gray-600 mb-6">
                Vous devez être connecté pour acheter
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Projet validé par des experts</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Accès immédiat après paiement
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Fichiers et documents inclus</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Support technique disponible</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Images</span>
                  <span className="font-semibold text-gray-900">
                    {project.images?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fichiers</span>
                  <span className="font-semibold text-gray-900">
                    {project.files?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date de publication</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(project.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
          >
            <FiX className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Image agrandie"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PublicProjectDetails;