// src/features/worker/workerService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface WorkerStats {
  accepted_projects: number;
  rejected_projects: number;
  total_amount_received: number;
  total_amount: number;
  total_projects: number;
}

export interface AcceptedProject {
  id: number;
  uuid: string;
  name: string;
  current_amount: string;
  amount_to_perceive: string;
  total_sales: number;
  total_amount_received: string;
  amount_set_at: string;
}

export interface ActiveProject {
  id: number;
  uuid?: string;
  name?: string;
  title?: string;
  status: string;
  location?: string;
  start_date?: string;
  created_at?: string;
}

export interface RecentProject {
  id: number;
  uuid?: string;
  name?: string;
  title?: string;
  status: string;
  created_at?: string;
  current_amount?: string;
  amount?: string;
  total_amount_received?: string;
}

export interface WorkerAvailability {
  id: number;
  start_date: string;
  end_date?: string;
  is_available?: boolean;
}

export interface WorkerNotification {
  id: number;
  project_id: number;
  project_name?: string;
  project?: {
    id: number;
    name: string;
    uuid?: string;
    status?: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
}

/** Notification reçue par un engin (même structure que WorkerNotification) */
export interface EnginNotification {
  id: number;
  project_id: number;
  project_name?: string;
  project?: {
    id: number;
    name: string;
    uuid?: string;
    status?: string;
  };
  /** Tâche assignée à l'engin */
  task?: string;
  start_at?: string;
  end_at?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'refused';
  created_at: string;
  updated_at?: string;
}

/** Projet retourné par GET /api/worker/my-projects */
export interface MyProject {
  id: number;
  uuid?: string;
  name?: string;
  title?: string;
  status: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  amount_to_perceive?: string;
  amount_received?: string;
  reference?: string;
  /** Objet projet imbriqué (réponse API réelle) */
  project?: {
    id: number;
    name: string;
    uuid?: string;
    status: string;
    amount?: string;
    started_at?: string;
    ended_at?: string | null;
  };
  task?: string;
  note?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  assigned_at?: string;
}

export type NotificationResponse = 'accepted' | 'rejected';
export type EnginNotificationResponse = 'accepted' | 'refused';

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

const authHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Token d'authentification manquant");
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
};

const jsonHeaders = () => ({
  ...authHeaders(),
  'Content-Type': 'application/json',
});

const handleError = (error: any, context: string): never => {
  if (error.response?.status === 401) throw new Error('Non autorisé. Veuillez vous reconnecter.');
  if (error.response?.status === 403) throw new Error('Accès refusé.');
  if (error.response) throw new Error(error.response.data?.message || `Erreur lors de ${context}`);
  if (error.request)  throw new Error('Impossible de contacter le serveur');
  throw error;
};

// ─── SERVICE ──────────────────────────────────────────────────────────────────

const workerService = {

  // ── Stats ──────────────────────────────────────────────────────────────────
  fetchWorkerStats: async (): Promise<WorkerStats> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/stats`, { headers: authHeaders() });
      return data.data;
    } catch (error: any) { handleError(error, 'récupération des statistiques'); }
  },

  // ── Projets ────────────────────────────────────────────────────────────────
  fetchAcceptedProjects: async (): Promise<AcceptedProject[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/accepted-projects`, { headers: authHeaders() });
      return data.data;
    } catch (error: any) { handleError(error, 'récupération des projets acceptés'); }
  },

  fetchActiveProjects: async (): Promise<ActiveProject[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/active-projects`, { headers: authHeaders() });
      return data.data ?? [];
    } catch (error: any) { handleError(error, 'récupération des projets actifs'); }
  },

  fetchRecentProjects: async (): Promise<RecentProject[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/recent-projects`, {
        headers: authHeaders(),
        params: { limit: 5 },
      });
      return data.data ?? [];
    } catch (error: any) { handleError(error, 'récupération des projets récents'); }
  },

  /**
   * GET /api/worker/my-projects
   * Projets où le worker est assigné ET a accepté.
   */
  fetchMyProjects: async (): Promise<MyProject[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/my-projects`, { headers: authHeaders() });
      return Array.isArray(data) ? data : (data.data ?? []);
    } catch (error: any) { handleError(error, 'récupération de mes projets'); }
  },

  // ── Disponibilités ─────────────────────────────────────────────────────────
  fetchWorkerAvailabilities: async (): Promise<WorkerAvailability[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/availabilities`, { headers: authHeaders() });
      return data.data ?? [];
    } catch (error: any) { handleError(error, 'récupération des disponibilités'); }
  },

  // ── Notifications worker ───────────────────────────────────────────────────
  fetchMyNotifications: async (): Promise<WorkerNotification[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/worker/my-notifications`, { headers: authHeaders() });
      return Array.isArray(data) ? data : (data.data ?? []);
    } catch (error: any) { handleError(error, 'récupération des notifications'); }
  },

  respondToNotification: async (
    id: number,
    status: NotificationResponse
  ): Promise<WorkerNotification> => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/worker/notifications/${id}/respond`,
        { status },
        { headers: jsonHeaders() }
      );
      return data.data ?? data;
    } catch (error: any) { handleError(error, 'réponse à la notification'); }
  },

  // ── Notifications engin ────────────────────────────────────────────────────
  /**
   * GET /api/engin/my-notifications
   * Notifications d'assignation reçues par l'engin.
   */
  fetchEnginNotifications: async (): Promise<EnginNotification[]> => {
    try {
      const { data } = await axios.get(`${API_URL}/engin/my-notifications`, { headers: authHeaders() });
      return Array.isArray(data) ? data : (data.data ?? []);
    } catch (error: any) { handleError(error, 'récupération des notifications engin'); }
  },

  /**
   * PATCH /api/engin/notifications/{id}/respond
   * Accepter ou refuser une assignation engin.
   */
  respondToEnginNotification: async (
    id: number,
    status: EnginNotificationResponse
  ): Promise<EnginNotification> => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/engin/notifications/${id}/respond`,
        { status },
        { headers: jsonHeaders() }
      );
      return data.data ?? data;
    } catch (error: any) { handleError(error, 'réponse à la notification engin'); }
  },

  // ── Retrait worker (admin) ──────────────────────────────────────────────────
  removeWorkerFromProject: async (projectId: number, userId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}/workers/${userId}`, {
        headers: authHeaders(),
      });
    } catch (error: any) { handleError(error, 'retrait du worker du projet'); }
  },


  removeEnginFromProject: async (
    projectId: number,
    pivotId: number            // id de la ligne project_user (pivot)
  ): Promise<void> => {
    try {
      // ⚠️ À mettre à jour selon l'endpoint réel retourné par l'équipe back
      await axios.delete(`${API_URL}/project-users/${pivotId}`, {
        headers: authHeaders(),
      });
    } catch (error: any) { handleError(error, 'retrait de l\'engin du projet'); }
  },
};

export default workerService;