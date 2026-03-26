import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Token d'authentification manquant");
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
};

const jsonHeaders = () => ({
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
});

export const extractErrorMessage = (e: any, fallback: string): string =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  (typeof e?.response?.data === 'string' ? e.response.data : null) ||
  e?.message ||
  fallback;

export const extractSuccessMessage = (res: any, fallback: string): string =>
  res?.data?.message || fallback;

export interface LaunchInfo {
  deadline: number;
  started_at: string;
  launch_status: 'ongoing' | 'completed' | 'pending';
  localisation_worker_id: number;
}

export interface ManagerLaunchInfo {
  deadline: number;
  started_at: string;
  launch_status: 'ongoing' | 'completed' | 'pending';
}

export interface AssignedWorker {
  id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  lot: string | null;
  task: string | null;
  note: number | null;
  start_at: string | null;
  end_at: string | null;
}

export interface AssignedEngin {
  id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  task: string | null;
  start_at: string | null;
  end_at: string | null;
  status: 'pending' | 'accepted' | 'refused' | null;
}

export interface AvailableEngin {
  user_id: number;
  engin: {
    nameOfTheEngin: string;
    brandOfTheDevice: string;
    feature: string;
  };
  city: string;
  latest_availability: {
    date: string;
    end_date: string;
  } | null;
}

export interface AssignEnginData {
  user_id: number;
  task?: string;
  start_at?: string;
  end_at?: string;
}

export interface ProjectUser {
  id: number;
  user_id: number;
  task?: string;
  note?: number;
  start_at?: string;
  end_at?: string;
  user?: {
    id: number;
    contact?: {
      firstName: string;
      lastName: string;
      email?: string;
      phoneNumber?: string;
      localisation?: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface AssignUserData {
  user_id: number;
  task?: string;
  note?: number;
  start_at?: string;
  end_at?: string;
}

export interface UpdateAssignmentData {
  task?: string;
  note?: number;
  start_at?: string;
  end_at?: string;
}

export interface Job {
  id: number;
  name: string;
  launch_status: 'ongoing' | 'completed' | 'pending' | null;
  deadline: number | null;
  started_at: string | null;
  ended_at: string | null;
  localisation_worker_id: number | null;
  workers_found: number;
  status?: string;
  accepted?: boolean;
  description?: string;
  localisation?: string | { id: number; name: string } | null;
  assigned_workers?: AssignedWorker[];
  assigned_engins?: AssignedEngin[];
  workers?: any[];
  [key: string]: any;
}

export interface ManagerProjectsParams {
  name?: string;
  perPage?: number;
  page?: number;
}

export interface ManagerProjectsResponse {
  data: Job[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

const jobsService = {

  fetchJobs: async (): Promise<Job[]> => {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: getAuthHeaders(),
      params: { status: 'accepted' },
    });
    return Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  },

  fetchJob: async (projectId: number): Promise<Job> => {
    const response = await axios.get(`${API_URL}/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    const raw = response.data.data || response.data;
    if (raw.workers_found == null && Array.isArray(raw.assigned_workers)) {
      raw.workers_found = raw.assigned_workers.length;
    }
    return raw;
  },

  fetchManagerProjects: async (params: ManagerProjectsParams): Promise<ManagerProjectsResponse> => {
    const response = await axios.post(
      `${API_URL}/manager/my-projects`,
      { name: params.name || '', perPage: params.perPage || 10, page: params.page || 1 },
      { headers: jsonHeaders() }
    );
    const raw = response.data.data || response.data;
    if (Array.isArray(raw)) {
      return { data: raw, total: raw.length, current_page: 1, last_page: 1, per_page: 10 };
    }
    return {
      data: Array.isArray(raw.data) ? raw.data : [],
      total: raw.total ?? 0,
      current_page: raw.current_page ?? 1,
      last_page: raw.last_page ?? 1,
      per_page: raw.per_page ?? 10,
    };
  },

  fetchManagerJob: async (projectId: number): Promise<Job> => {
    const response = await axios.get(`${API_URL}/manager/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    const raw = response.data.data || response.data;
    if (raw.workers_found == null && Array.isArray(raw.assigned_workers)) {
      raw.workers_found = raw.assigned_workers.length;
    }
    return raw;
  },

  setLaunchInfo: async (projectId: number, data: LaunchInfo): Promise<string> => {
    const res = await axios.post(`${API_URL}/projects/${projectId}/set-launch-info`, data, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Lancement configuré !');
  },

  updateLaunchInfo: async (projectId: number, data: Partial<LaunchInfo>): Promise<string> => {
    const res = await axios.patch(`${API_URL}/projects/${projectId}/update-launch-info`, data, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Lancement mis à jour !');
  },

  deleteLaunchInfo: async (projectId: number): Promise<string> => {
    const res = await axios.delete(`${API_URL}/projects/${projectId}/delete-launch-info`, { headers: getAuthHeaders() });
    return extractSuccessMessage(res, 'Informations de lancement supprimées');
  },

  setEndDate: async (projectId: number, endDate: string): Promise<string> => {
    const res = await axios.patch(`${API_URL}/projects/${projectId}/set-end-date`, { end_at: endDate }, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Date de fin définie !');
  },

  managerUpdateLaunch: async (projectId: number, data: ManagerLaunchInfo): Promise<string> => {
    const res = await axios.post(`${API_URL}/manager/projects/${projectId}/update-launch`, data, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Lancement configuré !');
  },

  fetchAssignedUsers: async (projectId: number): Promise<ProjectUser[]> => {
    const response = await axios.get(`${API_URL}/projects/${projectId}/assigned-users`, { headers: getAuthHeaders() });
    const raw = response.data.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  },

  assignUser: async (projectId: number, data: AssignUserData): Promise<string> => {
    const res = await axios.post(`${API_URL}/projects/${projectId}/assign-user`, data, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Travailleur assigné au projet !');
  },

  removeAssignedUser: async (assignmentId: number): Promise<string> => {
    const res = await axios.delete(`${API_URL}/project-users/${assignmentId}`, { headers: getAuthHeaders() });
    return extractSuccessMessage(res, 'Travailleur retiré du projet');
  },

  updateAssignedUser: async (assignmentId: number, data: UpdateAssignmentData): Promise<string> => {
    const res = await axios.patch(`${API_URL}/project-users/${assignmentId}`, data, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Assignation mise à jour');
  },

  addWorkerToJob: async (jobId: number, userId: number): Promise<string> => {
    const res = await axios.post(`${API_URL}/projects/${jobId}/assign-user`, { user_id: userId }, { headers: jsonHeaders() });
    return extractSuccessMessage(res, 'Travailleur ajouté !');
  },

  removeWorkerFromJob: async (_jobId: number, pivotId: number): Promise<string> => {
    const res = await axios.delete(`${API_URL}/project-users/${pivotId}`, { headers: getAuthHeaders() });
    return extractSuccessMessage(res, 'Travailleur retiré');
  },

  /**
   * PATCH /api/manager/project-users/{id}/note
   * id = project_users.id (AssignedWorker.id)
   * body: { note: number } — valeur entre 0 et 10
   */
  managerRateWorker: async (projectUserId: number, note: number): Promise<string> => {
    const res = await axios.patch(
      `${API_URL}/manager/project-users/${projectUserId}/note`,
      { note },
      { headers: jsonHeaders() }
    );
    return extractSuccessMessage(res, 'Note ajoutée avec succès');
  },

  fetchAvailableEngins: async (projectId: number): Promise<AvailableEngin[]> => {
    const res = await axios.get(`${API_URL}/projects/${projectId}/available-engins`, {
      headers: getAuthHeaders(),
    });
    const raw = res.data.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  },

  fetchAssignedEngins: async (projectId: number): Promise<AssignedEngin[]> => {
    const res = await axios.get(`${API_URL}/projects/${projectId}/assigned-engins`, {
      headers: getAuthHeaders(),
    });
    const raw = res.data.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  },

  assignEngin: async (projectId: number, data: AssignEnginData): Promise<string> => {
    const res = await axios.post(
      `${API_URL}/projects/${projectId}/assign-engin`,
      data,
      { headers: jsonHeaders() }
    );
    return extractSuccessMessage(res, 'Engin assigné avec notification !');
  },

  removeEnginFromJob: async (projectId: number, userId: number): Promise<string> => {
    const res = await axios.delete(
      `${API_URL}/projects/${projectId}/engins/${userId}`,
      { headers: getAuthHeaders() }
    );
    return extractSuccessMessage(res, 'Engin retiré du projet');
  },
};

export default jobsService;