// src/pages/admin/ProjectObservations.tsx
// VERSION CORRIGÉE pour la structure d'API réelle

import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiPlus, FiEdit2, FiTrash2, FiFileText, FiEye, FiImage as FiImageIcon, FiX } from 'react-icons/fi';
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
import { BackendObservation, Observation, ProjectFile, ProjectImage, ProjectObservationsProps } from '../../types';
import ObservationViewer from '../../components/observations/ObservationViewer';
import FileAnnotator from '../../components/admin/FileAnnotator';




const ProjectObservations: React.FC<ProjectObservationsProps> = ({
  projectId,
  readOnly = false,
  projectFiles = [],
  projectImages = [],
}) => {
  const dispatch = useAppDispatch();

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

  // Annotation
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    name: string;
    type: 'pdf' | 'image' | 'dwg' | 'bim';
    id: number;
    isProjectFile: boolean;
  } | null>(null);

  // Viewer
  const [showViewer, setShowViewer] = useState(false);
  const [viewerData, setViewerData] = useState<{
    url: string;
    name: string;
    type: 'pdf' | 'image' | 'dwg' | 'bim';
    observations: Observation[];
  } | null>(null);

  useEffect(() => {
    dispatch(fetchObservations(projectId));
  }, [projectId, dispatch]);

  //  Log des props reçues pour débogage
  useEffect(() => {
    console.log(' Props reçues dans ProjectObservations:');
    console.log('  - projectFiles:', projectFiles.length, 'fichier(s)');
    console.log('  - projectImages:', projectImages.length, 'image(s)');
    console.log('  - observations:', observations.length, 'observation(s)');
    
    if (observations.length > 0) {
      console.log(' Structure des observations:', observations[0]);
    }
  }, [projectFiles, projectImages, observations]);

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

  const getFileType = (filename: string): 'pdf' | 'image' | 'dwg' | 'bim' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'dwg') return 'dwg';
    if (['ifc', 'rvt'].includes(ext || '')) return 'bim';
    return 'image';
  };

  const handleSelectFileToAnnotate = () => {
    const annotatableFilesFiltered = projectFiles.filter((file) => {
      const type = getFileType(file.filename);
      return type !== 'dwg' && type !== 'bim';
    });

    if (annotatableFilesFiltered.length === 0 && projectImages.length === 0) {
      toast.error('Aucun fichier annotable disponible (seuls les images et PDF sont supportés pour le moment)');
      return;
    }
    setShowFileSelector(true);
  };

  const handleFileSelected = (file: ProjectFile | ProjectImage, type: 'file' | 'image') => {
    const fileName = type === 'file' ? (file as ProjectFile).filename : `image_${file.id}.jpg`;
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

  const handleAnnotationSave = async (observation: BackendObservation) => {
    try {
      await dispatch(
        createObservation({
          projectId,
          observationData: observation,
        })
      ).unwrap();

      setShowAnnotator(false);
      setSelectedFile(null);
      toast.success(' Observation créée avec succès !');
    } catch (err: any) {
      console.error('Erreur création:', err);
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
    } catch (err: any) {
      console.error('Erreur:', err);
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
    } catch (err: any) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', critical: 'warning' });
    setShowForm(false);
    setEditingId(null);
  };

  //  FONCTION CORRIGÉE pour utiliser la VRAIE structure de l'API
  const handleViewAnnotations = (obs: Observation) => {
    console.log(' Tentative de visualisation de l\'observation:', obs);

    if (!obs.coordinates) {
      toast.error('Cette observation n\'a pas de coordonnées associées');
      console.warn(' Observation sans coordonnées:', obs);
      return;
    }

    //  Vérifier que document existe
    if (!obs.document) {
      console.error('❌ Observation sans document:', obs);
      toast.error('Cette observation n\'a pas de document associé');
      return;
    }

    console.log(' Document trouvé:', obs.document);
    console.log(' Type de document:', obs.document_type);

    //  Utiliser DIRECTEMENT les données du document de l'observation
    const fileUrl = obs.document.url;
    const fileName = obs.document.filename || `${obs.document_type}_${obs.document.id}`;
    const fileType = obs.document_type as 'pdf' | 'image' | 'dwg' | 'bim';

    console.log(' Fichier extrait de l\'observation:');
    console.log('  - URL:', fileUrl.substring(0, 50) + '...');
    console.log('  - Nom:', fileName);
    console.log('  - Type:', fileType);

    // Récupérer toutes les observations pour ce document
    const fileObservations = observations.filter((o) => {
      return o.document && o.document.id === obs.document.id;
    });

    console.log(' Observations pour ce document:', fileObservations.length);
    console.log(' Ouverture du viewer avec:', { fileName, fileType, observationsCount: fileObservations.length });

    setViewerData({
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
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm"
                >
                  <FiFileText className="h-4 w-4" />
                  Annoter un fichier
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
                >
                  <FiPlus className="h-4 w-4" />
                  Observation simple
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Formulaire simple */}
      {!readOnly && showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'observation *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de criticité *</label>
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

      {/* Modal sélection fichier */}
      {showFileSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">📎 Sélectionner un fichier à annoter</h3>
                <button onClick={() => setShowFileSelector(false)} className="text-gray-500 hover:text-gray-700 p-1">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Images */}
              {projectImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                    <FiImageIcon className="w-5 h-5 text-purple-600" />
                    Images ({projectImages.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {projectImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => handleFileSelected(image, 'image')}
                        className="cursor-pointer border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 hover:shadow-lg transition-all"
                      >
                        <img src={image.url} alt={`Image ${image.id}`} className="w-full h-40 object-cover" />
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-xs text-gray-600">Image #{image.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichiers */}
              {(() => {
                const annotatableFilesFiltered = projectFiles.filter((file) => {
                  const type = getFileType(file.filename);
                  return type !== 'dwg' && type !== 'bim';
                });
                
                return annotatableFilesFiltered.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                      <FiFileText className="w-5 h-5 text-blue-600" />
                      Fichiers PDF ({annotatableFilesFiltered.length})
                    </h4>
                    <div className="space-y-2">
                      {annotatableFilesFiltered.map((file) => {
                        const type = getFileType(file.filename);
                        return (
                          <button
                            key={file.id}
                            onClick={() => handleFileSelected(file, 'file')}
                            className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl text-left transition-all flex items-center gap-3"
                          >
                            <div className={`px-3 py-2 rounded-lg text-xs font-bold ${
                              type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {type.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{file.filename}</p>
                              <p className="text-xs text-gray-500">ID: {file.id}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const annotatableFilesFiltered = projectFiles.filter((file) => {
                  const type = getFileType(file.filename);
                  return type !== 'dwg' && type !== 'bim';
                });
                
                return projectImages.length === 0 && annotatableFilesFiltered.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="font-semibold mb-2">Aucun fichier annotable disponible</p>
                    <p className="text-sm">Seuls les images et PDF sont supportés pour le moment.</p>
                    <p className="text-xs mt-2 text-gray-400">Les fichiers DWG et BIM nécessitent une conversion serveur.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Annotateur */}
      {showAnnotator && selectedFile && (
        <FileAnnotator
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

      {/* Viewer */}
      {showViewer && viewerData && (
        <ObservationViewer
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          fileType={viewerData.type}
          observations={viewerData.observations}
          onClose={() => {
            setShowViewer(false);
            setViewerData(null);
          }}
        />
      )}

      {/* Liste observations */}
      {isLoading && observations.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : observations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiAlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">Aucune observation pour le moment</p>
          {!readOnly && (
            <p className="text-sm mt-2 text-gray-400">
              Cliquez sur "Annoter un fichier" pour marquer directement les zones sur vos fichiers
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map((obs) => (
            <div
              key={obs.id}
              className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{obs.name}</h3>
                    {getCriticalBadge(obs.critical)}
                    {obs.coordinates && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        <FiFileText className="h-3 w-3 mr-1" />
                        Zone marquée
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{obs.description}</p>
                  
                  {obs.coordinates && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleViewAnnotations(obs)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-medium"
                      >
                        <FiEye className="h-4 w-4" />
                        Voir sur le fichier
                      </button>
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(obs)}
                      disabled={isDeleting}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(obs.id)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">Ajoutée le {formatDate(obs.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectObservations;