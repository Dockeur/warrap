// src/utils/constants.ts

export const USER_ROLES = {
  WORKER: 'worker',
  ENGINEER: 'engineer',
} as const;

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const NOTIFICATION_TYPES = {
  PROJECT_ASSIGNMENT: 'project_assignment',
  APPLICATION: 'application',
  RATING: 'rating',
  PROJECT_UPDATE: 'project_update',
} as const;

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Common
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
 // admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USER_MANAGEMENT: "/admin/user",
  // Worker
  WORKER_DASHBOARD: '/worker/dashboard',
  WORKER_AVAILABILITY: '/worker/availability',
  WORKER_APPLICATIONS: '/worker/applications',
  WORKER_PROJECTS: '/worker/projects',

  // Engineer
  ADMIN_DETAILJOBS: '/engineer/jobs/:id',
  ADMIN_JOBS: '/engineer/jobs',
  ENGINEER_DASHBOARD: '/engineer/dashboard',
  ENGINEER_WORKERS: '/engineer/workers',
  ENGINEER_WORKER_PROFILE: '/user/profil/:id',
  ENGINEER_PROJECTS: '/engineer/projects',
  ENGINEER_CREATE_PROJECT: '/engineer/projects/create',
  ENGINEER_LIST_PROJECT: '/engineer/projects/list',
  ENGINEER_PROJECT_DETAILS: '/engineer/projects/:id',
  ENGINEER_EDIT_PROJECT: '/engineer/projects/:id/edit',
  ENGINEER_MANAGE_APPLICATIONS: '/engineer/projects/:id/applications',
  ENGINEER_RATE_WORKER: '/engineer/projects/:projectId/rate/:workerId',

  // Projects (accessible aux deux)
  PROJECT_DETAILS: '/projects/:id',
} as const;

export const API_ENDPOINTS = {


 
  // Auth
  LOGIN: '/loginWorker ',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Users
  USERS: '/users',
  WORKERS: '/users/workers',
  WORKER: (id: number) => `/users/workers/${id}`,
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/avatar',

  // Availability
  AVAILABILITY: '/availability',
  AVAILABILITY_BY_ID: (id: number) => `/availability/${id}`,

  // Projects
  PROJECTS: '/projects',
  PROJECT: (id: number) => `/projects/${id}`,
  MY_PROJECTS: '/projects/my-projects',
  PROJECT_WORKERS: (id: number) => `/projects/${id}/workers`,
  ADD_WORKERS: (id: number) => `/projects/${id}/add-workers`,
  REMOVE_WORKER: (projectId: number, workerId: number) =>
    `/projects/${projectId}/workers/${workerId}`,
  CLOSE_PROJECT: (id: number) => `/projects/${id}/close`,

  // Applications
  APPLICATIONS: '/applications',
  APPLICATION: (id: number) => `/applications/${id}`,
  MY_APPLICATIONS: '/applications/my-applications',
  PROJECT_APPLICATIONS: (projectId: number) => `/applications/project/${projectId}`,
  ACCEPT_APPLICATION: (id: number) => `/applications/${id}/accept`,
  REJECT_APPLICATION: (id: number) => `/applications/${id}/reject`,

  // Ratings
  RATINGS: '/ratings',
  RATING: (id: number) => `/ratings/${id}`,
  WORKER_RATINGS: (workerId: number) => `/ratings/worker/${workerId}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_AS_READ: (id: number) => `/notifications/${id}/read`,
  MARK_ALL_AS_READ: '/notifications/read-all',
} as const;

export const PROFESSIONS = [
  'Maçon',
  'Électricien',
  'Plombier',
  'Menuisier',
  'Peintre',
  'Carreleur',
  'Soudeur',
  'Mécanicien',
  'Charpentier',
  'Couvreur',
  'Jardinier',
  'Chauffagiste',
  'Autre',
];

export const SKILLS = [
  'Maçonnerie',
  'Électricité',
  'Plomberie',
  'Menuiserie',
  'Peinture',
  'Carrelage',
  'Soudure',
  'Mécanique',
  'Charpente',
  'Couverture',
  'Jardinage',
  'Chauffage',
  'Climatisation',
  'Isolation',
  'Béton',
  'Ferraillage',
  'Gestion de projet',
  'Lecture de plans',
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 20, 50, 100],
};

export const RATING_SCALE = {
  MIN: 1,
  MAX: 5,
};

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_TIME: "yyyy-MM-dd'T'HH:mm:ss",
};

export const generateProjectUrl = (id: number) => `/engineer/projects/${id}`;
export const generateEditProjectUrl = (id: number) => `/engineer/projects/${id}/edit`;
export const generateApplicationsUrl = (projectId: number) => `/engineer/projects/${projectId}/applications`;
