// src/pages/admin/ProjectObservationsWithAnnotations.tsx
import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiFileText, FiImage as FiImageIcon } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchObservations,
  createObservation,
  updateObservation,
  deleteObservation,
  clearError,
  clearSuccessMessage,
  selectObservations,
  selectIsLoading,
  selectIsCreating,
  selectIsUpdating,
  selectIsDeleting,
  selectError,
  selectSuccessMessage,
} from '../../features/observations/observationsSlice';
import type { Observation } from '../../features/observations/observationsService';
import AdvancedFileAnnotator from '../../components/admin/FileAnnotator';
import type { FileAnnotation } from '../../components/admin/FileAnnotator';
import ObservationViewer from '../../components/observations/ObservationViewer';

interface ProjectFile {
  id: number;
  filename: string;
  url: string;
}

interface ProjectImage {
  id: number;
  url: string;
}

interface ProjectObservationsProps {
  projectId: number;
  readOnly?: boolean;
  projectFiles?: ProjectFile[];
  projectImages?: ProjectImage[];
}

const ProjectObservationsWithAnnotations: React.FC<ProjectObservationsProps> = ({
  projectId,
  readOnly = false,
  projectFiles = [],
  projectImages = [],
}) => {
  const dispatch = useAppDispatch();

  // Sélecteurs Redux
  const observations = useAppSelector(selectObservations);
  const isLoading = useAppSelector(selectIsLoading);
  const isCreating = useAppSelector(selectIsCreating);
  const isUpdating = useAppSelector(selectIsUpdating);
  const isDeleting = useAppSelector(selectIsDeleting);
  const error = useAppSelector(selectError);
  const successMessage = useAppSelector(selectSuccessMessage);

  // États locaux
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    critical: 'warning' as 'warning' | 'rejected' | 'accepted',
  });

  // États pour l'annotation
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: 'pdf' | 'image' | 'dwg';
    id: number;
    isProjectFile: boolean;
  } | null>(null);

  // États pour le viewer
  const [showViewer, setShowViewer] = useState(false);
  const [viewerFile, setViewerFile] = useState<{
    url: string;
    name: string;
    type: 'pdf' | 'image' | 'dwg';
    observations: Observation[];
  } | null>(null);

  // Charger les observations au montage
  useEffect(() => {
    dispatch(fetchObservations(projectId));
  }, [projectId, dispatch]);

  // ✅ Log des props reçues pour débogage
  useEffect(() => {
    console.log('📦 Props reçues:');
    console.log('  - projectFiles:', projectFiles.length, 'fichier(s)');
    console.log('  - projectImages:', projectImages.length, 'image(s)');
    console.log('  - observations:', observations.length, 'observation(s)');
  }, [projectFiles, projectImages, observations]);

  // Gérer les messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [error, successMessage, dispatch]);

  const getCriticalBadge = (critical: string) => {
    const configs = {
      warning: {
        icon: FiAlertTriangle,
        label: 'Avertissement',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        iconColor: 'text-orange-600',
      },
      rejected: {
        icon: FiXCircle,
        label: 'Rejeté',
        className: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600',
      },
      accepted: {
        icon: FiCheckCircle,
        label: 'Accepté',
        className: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600',
      },
    };

    const config = configs[critical as keyof typeof configs] || configs.warning;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileType = (filename: string): 'pdf' | 'image' | 'dwg' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'dwg') return 'dwg';
    return 'image';
  };

  const handleSelectFileToAnnotate = () => {
    setShowFileSelector(true);
  };

  const handleFileSelected = (file: ProjectFile | ProjectImage, type: 'file' | 'image') => {
    const fileName = type === 'file' ? (file as ProjectFile).filename : `image_${(file as ProjectImage).id}.jpg`;
    const fileType = type === 'file' ? getFileType((file as ProjectFile).filename) : 'image';

    setSelectedFile({
      url: file.url,
      name: fileName,
      type: fileType,
      id: file.id,
      isProjectFile: type === 'file',
    });
    setShowFileSelector(false);
    setShowAnnotator(true);
  };

  const handleAnnotationSave = async (annotation: FileAnnotation) => {
    try {
      await dispatch(
        createObservation({
          projectId,
          observationData: annotation,
        })
      ).unwrap();

      setShowAnnotator(false);
      setSelectedFile(null);
    } catch (err) {
      // L'erreur est gérée par le useEffect
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (editingId) {
        await dispatch(
          updateObservation({
            projectId,
            observationId: editingId,
            observationData: {
              critical: formData.critical,
              description: formData.description,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createObservation({
            projectId,
            observationData: formData,
          })
        ).unwrap();
      }

      setFormData({ name: '', description: '', critical: 'warning' });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      // L'erreur est gérée par le useEffect
    }
  };

  const handleEdit = (observation: Observation) => {
    setFormData({
      name: observation.name,
      description: observation.description,
      critical: observation.critical,
    });
    setEditingId(observation.id);
    setShowForm(true);
  };

  const handleDelete = async (observationId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
      return;
    }

    try {
      await dispatch(
        deleteObservation({
          projectId,
          observationId,
        })
      ).unwrap();
    } catch (err) {
      // L'erreur est gérée par le useEffect
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', critical: 'warning' });
    setShowForm(false);
    setEditingId(null);
  };

  // ✅ FONCTION CORRIGÉE avec gestion d'erreur améliorée
  const handleViewAnnotations = (obs: Observation) => {
    console.log('👀 Tentative de visualisation de l\'observation:', obs);

    if (!obs.coordinates) {
      toast.error('Cette observation n\'a pas de coordonnées associées');
      console.warn('⚠️ Observation sans coordonnées:', obs);
      return;
    }

    let fileUrl: string;
    let fileName: string;
    let fileType: 'pdf' | 'image' | 'dwg';

    if (obs.project_image_id) {
      console.log('🔍 Recherche image ID:', obs.project_image_id);
      console.log('📦 Images disponibles:', projectImages.map(img => ({ id: img.id, url: img.url.substring(0, 50) + '...' })));
      
      const image = projectImages.find((img) => img.id === obs.project_image_id);
      
      if (!image) {
        console.error('❌ Image non trouvée, ID:', obs.project_image_id);
        console.error('❌ IDs disponibles:', projectImages.map(img => img.id));
        toast.error(`Image #${obs.project_image_id} non trouvée. Veuillez rafraîchir la page.`);
        return;
      }
      
      fileUrl = image.url;
      fileName = `image_${image.id}.jpg`;
      fileType = 'image';
      console.log('✅ Image trouvée:', fileName, '- URL:', fileUrl.substring(0, 50) + '...');
    } else if (obs.project_file_id) {
      console.log('🔍 Recherche fichier ID:', obs.project_file_id);
      console.log('📦 Fichiers disponibles:', projectFiles.map(f => ({ id: f.id, filename: f.filename })));
      
      const file = projectFiles.find((f) => f.id === obs.project_file_id);
      
      if (!file) {
        console.error('❌ Fichier non trouvé, ID:', obs.project_file_id);
        console.error('❌ IDs disponibles:', projectFiles.map(f => f.id));
        toast.error(`Fichier #${obs.project_file_id} non trouvé. Veuillez rafraîchir la page.`);
        return;
      }
      
      fileUrl = file.url;
      fileName = file.filename;
      fileType = getFileType(file.filename);
      console.log('✅ Fichier trouvé:', fileName, '- URL:', fileUrl.substring(0, 50) + '...');
    } else {
      console.error('❌ Observation sans fichier ni image associé:', obs);
      toast.error('Cette observation n\'est associée à aucun fichier');
      return;
    }

    // Récupérer toutes les observations pour ce fichier
    const fileObservations = observations.filter((o) => {
      if (obs.project_image_id) {
        return o.project_image_id === obs.project_image_id;
      } else {
        return o.project_file_id === obs.project_file_id;
      }
    });

    console.log('📝 Observations pour ce fichier:', fileObservations.length);
    console.log('🎯 Ouverture du viewer avec:', { fileName, fileType, observationsCount: fileObservations.length });

    setViewerFile({
      url: fileUrl,
      name: fileName,
      type: fileType,
      observations: fileObservations,
    });
    setShowViewer(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FiAlertTriangle className="mr-2 h-5 w-5 text-blue-600" />
          {readOnly ? 'Observations' : 'Observations du projet'}
        </h2>
        {!readOnly && (
          <div className="flex gap-2">
            {!showForm && (
              <>
                <button
                  onClick={handleSelectFileToAnnotate}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <FiFileText className="h-4 w-4" />
                  Annoter un fichier
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <FiPlus className="h-4 w-4" />
                  Observation simple
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/édition simple */}
      {!readOnly && showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'observation *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Problème de fondation"
                disabled={isCreating || isUpdating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez l'observation en détail..."
                disabled={isCreating || isUpdating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de criticité *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, critical: 'warning' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.critical === 'warning'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                  disabled={isCreating || isUpdating}
                >
                  <FiAlertTriangle className="h-4 w-4" />
                  Avertissement
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, critical: 'accepted' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.critical === 'accepted'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                  disabled={isCreating || isUpdating}
                >
                  <FiCheckCircle className="h-4 w-4" />
                  Accepté
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, critical: 'rejected' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.critical === 'rejected'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                  }`}
                  disabled={isCreating || isUpdating}
                >
                  <FiXCircle className="h-4 w-4" />
                  Rejeté
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCreating || isUpdating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating || isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Mise à jour...' : 'Ajout...'}
                  </>
                ) : (
                  editingId ? 'Mettre à jour' : 'Ajouter'
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* File Selector Modal */}
      {showFileSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Sélectionner un fichier à annoter</h3>
                <button
                  onClick={() => setShowFileSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Images */}
              {projectImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiImageIcon className="w-5 h-5" />
                    Images ({projectImages.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {projectImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => handleFileSelected(image, 'image')}
                        className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                      >
                        <img
                          src={image.url}
                          alt={`Image ${image.id}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichiers */}
              {projectFiles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText className="w-5 h-5" />
                    Fichiers ({projectFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {projectFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleFileSelected(file, 'file')}
                        className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-colors"
                      >
                        <p className="font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {getFileType(file.filename).toUpperCase()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {projectImages.length === 0 && projectFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun fichier disponible pour annotation
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced File Annotator */}
      {showAnnotator && selectedFile && (
        <AdvancedFileAnnotator
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
          fileType={selectedFile.type}
          fileId={selectedFile.id}
          isProjectFile={selectedFile.isProjectFile}
          onSave={handleAnnotationSave}
          onClose={() => {
            setShowAnnotator(false);
            setSelectedFile(null);
          }}
        />
      )}

      {/* Observation Viewer */}
      {showViewer && viewerFile && (
        <ObservationViewer
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          fileType={viewerFile.type}
          observations={viewerFile.observations}
          onClose={() => {
            setShowViewer(false);
            setViewerFile(null);
          }}
        />
      )}

      {/* Liste des observations */}
      {isLoading && observations.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : observations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p>Aucune observation pour le moment</p>
          {!readOnly && (
            <p className="text-sm mt-2">
              Cliquez sur "Annoter un fichier" pour marquer directement sur les images/PDF/DWG
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map((observation) => (
            <div
              key={observation.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{observation.name}</h3>
                    {getCriticalBadge(observation.critical)}
                    {observation.coordinates && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <FiFileText className="h-3 w-3 mr-1" />
                        Annotation
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{observation.description}</p>
                  
                  {observation.coordinates && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleViewAnnotations(observation)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiEye className="h-4 w-4" />
                        Voir sur le fichier
                      </button>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                {!readOnly && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(observation)}
                      disabled={isDeleting}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(observation.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Ajoutée le {formatDate(observation.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectObservationsWithAnnotations;
