// src/pages/engineer/CreateProject.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiFileText, FiImage, FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { clearError, clearSuccessMessage, createProject, resetUploadProgress, selectError, selectIsCreating, selectSuccessMessage, selectUploadProgress } from '../../features/projects/projectsSlice';

interface ProjectFormData {
  name: string;
  description: string;
  images: File[];
  files: File[];
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //  Sélecteurs Redux au lieu de useState pour isSubmitting et uploadProgress
  const isCreating = useAppSelector(selectIsCreating);
  const uploadProgress = useAppSelector(selectUploadProgress);
  const error = useAppSelector(selectError);
  const successMessage = useAppSelector(selectSuccessMessage);
  
  //  État local uniquement pour le formulaire et l'UI
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    images: [],
    files: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState<'images' | 'files' | null>(null);

  //  Gérer les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  //  Gérer le succès
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      
      // Rediriger après 1.5 secondes
      setTimeout(() => {
        dispatch(resetUploadProgress());
        navigate('/engineer/projects');
      }, 1500);
    }
  }, [successMessage, dispatch, navigate]);

  // Gestion des champs texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Gestion des images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      addImages(newImages);
    }
  };

  const addImages = (newImages: File[]) => {
    // Filtrer les fichiers image
    const imageFiles = newImages.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== newImages.length) {
      toast.warning('Seuls les fichiers image sont acceptés');
    }

    // Limiter à 10 images
    const totalImages = formData.images.length + imageFiles.length;
    if (totalImages > 10) {
      toast.warning('Maximum 10 images autorisées');
      return;
    }

    // Ajouter les images
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles],
    }));

    // Créer les prévisualisations
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Gestion des fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Limiter à 10 fichiers
    const totalFiles = formData.files.length + newFiles.length;
    if (totalFiles > 10) {
      toast.warning('Maximum 10 fichiers autorisés');
      return;
    }

    // Vérifier la taille (max 50MB par fichier)
    const oversizedFiles = newFiles.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Taille maximum par fichier : 50MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Drag & Drop pour images
  const handleImageDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive('images');
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addImages(files);
    }
  };

  // Drag & Drop pour fichiers
  const handleFileDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive('files');
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };

  // Obtenir l'extension du fichier
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  //  Soumission du formulaire avec Redux
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('La description est requise');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Ajoutez au moins une image');
      return;
    }

    console.log(' Envoi du projet via Redux...');

    //  Dispatcher l'action Redux
    const result = await dispatch(createProject({
      projectData: formData,
      onUploadProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    }));

    // Vérifier le résultat
    if (createProject.fulfilled.match(result)) {
      console.log(' Projet créé avec succès:', result.payload);
      // La redirection est gérée par l'effet useEffect ci-dessus
    } else if (createProject.rejected.match(result)) {
      console.error(' Erreur lors de la création:', result.payload);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-200">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Proposer un Projet
            </h1>
            <p className="text-gray-600">
              Partagez votre projet avec des plans, montages et fichiers 3D
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du projet */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Projet *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Immeuble résidentiel moderne"
                required
                disabled={isCreating}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Décrivez votre projet en détail : objectifs, spécifications techniques, contraintes..."
                required
                disabled={isCreating}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length} caractères
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images du Projet * (Max 10)
              </label>
              
              {/* Zone de drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive === 'images'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragEnter={handleImageDrag}
                onDragLeave={handleImageDrag}
                onDragOver={handleImageDrag}
                onDrop={handleImageDrop}
              >
                <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez vos images ici ou
                </p>
                <label className="inline-block">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    Parcourir
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isCreating}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, JPEG jusqu'à 10MB
                </p>
              </div>

              {/* Prévisualisation des images */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      )}
                      <p className="mt-1 text-xs text-gray-600 truncate">
                        {formData.images[index]?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fichiers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichiers (Plans, 3D, Documents) - Max 10
              </label>
              
              {/* Zone de drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive === 'files'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragEnter={handleFileDrag}
                onDragLeave={handleFileDrag}
                onDragOver={handleFileDrag}
                onDrop={handleFileDrop}
              >
                <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez vos fichiers ici ou
                </p>
                <label className="inline-block">
                  <span className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors">
                    Parcourir
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isCreating}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DWG, SKP, MP4, etc. jusqu'à 50MB par fichier
                </p>
              </div>

              {/* Liste des fichiers */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
                          {getFileExtension(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Barre de progression Redux */}
            {isCreating && uploadProgress > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 flex items-center">
                    <FiUpload className="h-4 w-4 mr-2 animate-bounce" />
                    Upload en cours...
                  </span>
                  <span className="text-sm font-bold text-blue-900">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Formats acceptés :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Images : JPG, PNG, JPEG</li>
                    <li>Documents : PDF, DOC, DOCX</li>
                    <li>Plans : DWG, DXF, SKP (SketchUp)</li>
                    <li>Vidéos : MP4, AVI, MOV</li>
                    <li>Autres : ZIP, RAR</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/engineer/projects')}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                {isCreating ? (
                  <>
                    <FiUpload className="h-5 w-5 animate-bounce" />
                    <span>Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-5 w-5" />
                    <span>Créer le Projet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;