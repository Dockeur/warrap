// src/features/users/usersService.ts
import axios from 'axios';
// import { WorkerFilters, WorkerProfile, Availability } from '../../types';
import { API_ENDPOINTS } from '../../utils/constants';
import { Availability } from '../availabilitiesService';
import { User } from '../../types';

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

// ─── TYPES ADMIN ─────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  profile: string;
  contact: { firstName: string; lastName: string; phoneNumber: string };
  account_type: { worker: string } | null;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  password_confirmation: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'validator' | 'corrector' | 'user';
}

export interface UpdateRolePayload {
  role: string;
}

// ─── TYPES COMPTES ────────────────────────────────────────────────────────────

export type AccountStatus = 'pending' | 'accepted' | 'rejected';

export interface AccountRequest {
  id: number;
  email: string;
  account_status: AccountStatus;
  profile?: string;
  contact?: { firstName: string; lastName: string; phoneNumber: string };
  account_type?: { worker: string } | null;
  created_at: string;
}

export interface AccountsPayload {
  status?: AccountStatus | '';
  name?: string;
  perPage?: number;
  page?: number;
}

export interface AccountsResponse {
  data: AccountRequest[];
  total: number;
  lastPage: number;
  currentPage: number;
}

// ─── TYPES LOTS ───────────────────────────────────────────────────────────────

export interface Lot {
  id: number;
  name: string;
  role: 'main' | 'child';
  main_id: number | null;
  children?: Lot[];
}

export interface CreateLotPayload {
  name: string;
  role: 'main' | 'child';
  main_id?: number;
}

// ─── SERVICE ─────────────────────────────────────────────────────────────────

const usersService = {

  // ── WORKERS ────────────────────────────────────────────────────────────────

  getWorkers: async (filters?: WorkerFilters): Promise<WorkerProfile[]> => {
    const response = await axios.get(`${API_URL}/workers`, {
      headers: getAuthHeaders(),
      params: filters,
    });

    const rawArray = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    return rawArray
      .filter((u: any) => u.firstName && u.lastName)
      .map((u: any): WorkerProfile => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        localisation: u.localisation,
        profession: u.worker,
        experience: u.years_of_experience ?? 0,
        rating: u.average_note ?? 0,
        totalRatings: u.total_jobs ?? 0,
        skills: u.lot ? [u.lot] : [],
        avatar: null,
        hourlyRate: null,
      }));
  },

  getWorkersDis: async (projectId: number): Promise<WorkerProfile[]> => {
    const response = await axios.get(`${API_URL}/projects/${projectId}/available-workers`, {
      headers: getAuthHeaders(),
    });

    console.log("mes data", response);

    const rawArray = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    console.log("les users disponible ", rawArray);

    return rawArray
      .filter((u: any) => u.firstName && u.lastName)
      .map((u: any): User => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        localisation: u.localisation,
        profession: u.worker,
        experience: u.years_of_experience ?? 0,
        rating: u.average_note ?? 0,
        totalRatings: u.total_jobs ?? 0,
        skills: u.lot ? [u.lot] : [],
        avatar: null,
        hourlyRate: null,
      }));
  },

  getWorker: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_URL}${API_ENDPOINTS.WORKER(id)}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data || response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axios.put(
      `${API_URL}${API_ENDPOINTS.UPDATE_PROFILE}`,
      data,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(
      `${API_URL}${API_ENDPOINTS.UPLOAD_AVATAR}`,
      formData,
      { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data?.url || response.data.url;
  },

  // ── AVAILABILITY ───────────────────────────────────────────────────────────

  getAvailability: async (): Promise<Availability[]> => {
    const response = await axios.get(`${API_URL}${API_ENDPOINTS.AVAILABILITY}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data || response.data;
  },

  createAvailability: async (data: Omit<Availability, 'id'>): Promise<Availability> => {
    const response = await axios.post(
      `${API_URL}${API_ENDPOINTS.AVAILABILITY}`,
      data,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  updateAvailability: async (id: number, data: Partial<Availability>): Promise<Availability> => {
    const response = await axios.put(
      `${API_URL}${API_ENDPOINTS.AVAILABILITY_BY_ID(id)}`,
      data,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}${API_ENDPOINTS.AVAILABILITY_BY_ID(id)}`, {
      headers: getAuthHeaders(),
    });
  },

  // ── ADMIN — USERS ──────────────────────────────────────────────────────────

  /** GET /api/admin/users — liste tous les utilisateurs */
  getAdminUsers: async (): Promise<AdminUser[]> => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return response.data.data || response.data.users || response.data || [];
  },

  /** POST /api/admin/create-user — créer un admin ou validator */
  createAdminUser: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await axios.post(
      `${API_URL}/admin/create-user`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  /** PUT /api/admin/users/:id/role — mettre à jour le rôle */
  updateUserRole: async (id: number, payload: UpdateRolePayload): Promise<AdminUser> => {
    const response = await axios.put(
      `${API_URL}/admin/users/${id}/role`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  // ── ADMIN — COMPTES ────────────────────────────────────────────────────────

  /**
   * POST /api/admin/accounts
   * Lister les comptes par statut avec recherche et pagination
   */
  getAccounts: async (payload: AccountsPayload): Promise<AccountsResponse> => {
    const response = await axios.post(
      `${API_URL}/admin/accounts`,
      payload,
      { headers: jsonHeaders() }
    );
    const raw = response.data;
    return {
      data:        raw.data        || raw.accounts || raw     || [],
      total:       raw.total       ?? 0,
      lastPage:    raw.last_page   ?? raw.lastPage  ?? 1,
      currentPage: raw.current_page ?? raw.currentPage ?? 1,
    };
  },

  /**
   * PATCH /api/admin/users/:id/update-account-status
   * Accepter ou rejeter une demande de compte
   */
  updateAccountStatus: async (
    id: number,
    status: 'accepted' | 'rejected'
  ): Promise<void> => {
    await axios.patch(
      `${API_URL}/admin/users/${id}/update-account-status`,
      { status },
      { headers: jsonHeaders() }
    );
  },

  // ── ADMIN — LOTS ───────────────────────────────────────────────────────────

  getLots: async (): Promise<Lot[]> => {

    const mainRes = await axios.get(`${API_URL}/lots/main`, {
      headers: getAuthHeaders(),
    });

    const rawMains: any[] = Array.isArray(mainRes.data)
      ? mainRes.data
      : Array.isArray(mainRes.data?.data)
      ? mainRes.data.data
      : Array.isArray(mainRes.data?.lots)
      ? mainRes.data.lots
      : [];

    const mainLots: Lot[] = rawMains.map((m: any) => ({
      id:      m.id,
      name:    m.name,
      role:    'main' as const,
      main_id: null,
    }));

    console.log('📦 Main lots:', mainLots);

    if (mainLots.length === 0) return [];

    const childResults = await Promise.all(
      mainLots.map(async (mainLot) => {
        try {
          const childRes = await axios.get(`${API_URL}/lots`, {
            headers: getAuthHeaders(),
            params: { name: mainLot.name },
          });

          const rawChildren: any[] = Array.isArray(childRes.data)
            ? childRes.data
            : Array.isArray(childRes.data?.data)
            ? childRes.data.data
            : Array.isArray(childRes.data?.lots)
            ? childRes.data.lots
            : [];

          return rawChildren.map((c: any) => ({
            id:      c.id,
            name:    c.name,
            role:    'child' as const,
            main_id: c.main_id ?? mainLot.id,
          }));
        } catch {
          return [];
        }
      })
    );

    const allChildren: Lot[] = childResults.flat();
    const result = [...mainLots, ...allChildren];

    console.log('✅ Tous les lots (main + children):', result);
    return result;
  },

  /** POST /api/lots/create — créer un lot (main ou child) */
  createLot: async (payload: CreateLotPayload): Promise<Lot> => {
    const response = await axios.post(
      `${API_URL}/lots/create`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },
};

export default usersService;