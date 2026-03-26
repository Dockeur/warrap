// src/features/projects/types.ts
// Types partagés pour la gestion des projets

/**
 * Image d'un projet
 */
export interface ProjectImage {
  id: number;
  url: string;
}

/**
 * Fichier d'un projet
 */
export interface ProjectFile {
  id: number;
  url: string;
  filename: string;
}

/**
 * Contact utilisateur
 */
export interface UserContact {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

/**
 * Utilisateur créateur du projet
 */
export interface ProjectUser {
  id: number;
  email: string | null;
  contact: UserContact;
}

/**
 * Projet complet
 */
export interface Project {
  id: number;
  name: string;
  uuid: string;
  description: string;
  status: ProjectStatus;
  amount: string;
  amount_to_perceive: string;
  accepted: boolean;
  images: ProjectImage[];
  files: ProjectFile[];
  created_at: string;
  updated_at: string;
  user: ProjectUser;
  project_solds: any[];
}

/**
 * Statut d'un projet
 */
export type ProjectStatus = 
  | 'published' 
  | 'unpublished' 
  | 'completed' 
  | 'in_progress'
  | 'draft';

/**
 * Configuration pour les badges de statut
 */
export interface StatusBadgeConfig {
  label: string;
  className: string;
}

/**
 * Map des configurations de statut
 */
export const STATUS_CONFIG: Record<ProjectStatus, StatusBadgeConfig> = {
  published: { 
    label: 'Publié', 
    className: 'bg-green-100 text-green-800' 
  },
  unpublished: { 
    label: 'Non publié', 
    className: 'bg-gray-100 text-gray-800' 
  },
  completed: { 
    label: 'Terminé', 
    className: 'bg-blue-100 text-blue-800' 
  },
  in_progress: { 
    label: 'En cours', 
    className: 'bg-yellow-100 text-yellow-800' 
  },
  draft: { 
    label: 'Brouillon', 
    className: 'bg-purple-100 text-purple-800' 
  },
};

/**
 * Réponse API pour la liste des projets
 */
export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  message?: string;
}

/**
 * Réponse API pour un projet unique
 */
export interface ProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

/**
 * Données pour créer un projet
 */
export interface CreateProjectData {
  name: string;
  description: string;
  images: File[];
  files: File[];
}

/**
 * Données pour mettre à jour un projet
 */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  images?: File[];
  files?: File[];
}

/**
 * Filtres pour la recherche de projets
 */
export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Options de tri
 */
export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'name_asc' 
  | 'name_desc';

/**
 * Statistiques d'un projet
 */
export interface ProjectStats {
  totalImages: number;
  totalFiles: number;
  totalSize: number;
  createdDaysAgo: number;
}

/**
 * Callback pour la progression de l'upload
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Paramètres pour la pagination
 */
export interface PaginationParams {
  page: number;
  perPage: number;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * État d'erreur
 */
export interface ErrorState {
  message: string;
  code?: string;
  field?: string;
}

/**
 * Options pour la requête API
 */
export interface ApiRequestOptions {
  token?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Formats de fichiers acceptés
 */
export const ACCEPTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ACCEPTED_FILE_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
  'video/mp4',
  'video/avi',
  'video/quicktime',
  // Formats CAD
  'application/acad',
  'application/x-dwg',
  'application/x-dxf',
  // SketchUp
  'application/vnd.sketchup.skp',
];

/**
 * Limites de fichiers
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGES: 10,
  MAX_FILES: 10,
};

/**
 * Messages d'erreur constants
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Impossible de contacter le serveur',
  UNAUTHORIZED: 'Vous devez être connecté',
  NOT_FOUND: 'Projet non trouvé',
  VALIDATION_ERROR: 'Erreur de validation',
  UPLOAD_FAILED: 'Erreur lors de l\'upload',
  DELETE_FAILED: 'Erreur lors de la suppression',
  UPDATE_FAILED: 'Erreur lors de la mise à jour',
  CREATE_FAILED: 'Erreur lors de la création',
};

/**
 * Helper pour obtenir l'extension d'un fichier
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

/**
 * Helper pour formater la taille d'un fichier
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Helper pour formater une date
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Helper pour tronquer un texte
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Helper pour vérifier si un fichier est une image
 */
export const isImageFile = (file: File): boolean => {
  return ACCEPTED_IMAGE_FORMATS.includes(file.type);
};

/**
 * Helper pour valider la taille d'un fichier
 */
export const validateFileSize = (file: File): boolean => {
  const maxSize = isImageFile(file) 
    ? FILE_LIMITS.MAX_IMAGE_SIZE 
    : FILE_LIMITS.MAX_FILE_SIZE;
  
  return file.size <= maxSize;
};

/**
 * Helper pour obtenir la configuration du badge de statut
 */
export const getStatusBadgeConfig = (status: string): StatusBadgeConfig => {
  return STATUS_CONFIG[status as ProjectStatus] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };
};

/**
 * Helper pour calculer les statistiques d'un projet
 */
export const calculateProjectStats = (project: Project): ProjectStats => {
  const totalSize = [
    ...project.images,
    ...project.files,
  ].reduce((sum, item) => sum + (item as any).size || 0, 0);

  const createdDate = new Date(project.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const createdDaysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    totalImages: project.images.length,
    totalFiles: project.files.length,
    totalSize,
    createdDaysAgo,
  };
};

/**
 * Type guard pour vérifier si c'est un Project
 */
export const isProject = (obj: any): obj is Project => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.images) &&
    Array.isArray(obj.files)
  );
};