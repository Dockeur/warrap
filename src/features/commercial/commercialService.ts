// src/features/commercial/commercialService.ts
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

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

export interface CommercialUser {
  id: number;
  email: string;
  account_type_id?: number;
  contact?: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  account_type?: {
    id: number;
    worker: string;
  };
}

export interface CommissionPayment {
  id: number;
  commission_id: number;
  amount_paid: number;
  note?: string;
  created_at: string;
  updated_at?: string;
}

// Shape retournée par /admin/commissions/list
export interface Commission {
  id: number;
  project_name?: string;
  project_sold_id: number;
  commercial?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  rate: string | number;
  commission_amount?: string;
  total_paid?: number;       // fourni directement par l'API
  remaining_amount?: number; // fourni directement par l'API
  // Anciens champs gardés pour compatibilité
  account_type_id?: number;
  status?: CommissionStatus;
  amount?: number;
  created_at: string;
  updated_at?: string;
  project_sold?: {
    id: number;
    customer_of_name: string;
    project?: {
      id: number;
      name: string;
      uuid: string;
      amount?: number;
    };
  };
  payments?: CommissionPayment[];
}

export interface CommissionListPayload {
  commercial_name?: string;
  perPage?: number;
  page?: number;
}

export interface PaginatedCommissions {
  data: Commission[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

export interface CreateCommissionPayload {
  project_sold_id: number;
  account_type_id: number;
  rate: number;
}

export interface UpdateCommissionStatusPayload {
  status: CommissionStatus;
}

export interface CreatePaymentPayload {
  commission_id: number;
  amount_paid: number;
  note?: string;
}

export interface PublicProject {
  id: number;
  name: string;
  uuid: string;
  description: string;
  status: string;
  amount?: string;
  accepted?: boolean;
  images?: { id: number; url: string }[];
  files?: { id: number; url: string; filename: string }[];
  user?: {
    id: number;
    email: string;
    contact?: { firstName: string; lastName: string; phoneNumber: string };
  };
  project_solds?: ProjectSold[];
  created_at: string;
}

export interface ProjectSold {
  id: number;
  customer_of_name: string;
  project_id?: number;
  created_at: string;
}

export interface RegisterSalePayload {
  customer_of_name: string;
}

// ─── SERVICE ──────────────────────────────────────────────────────────────────

const commercialService = {

  // ── COMMERCIAUX ─────────────────────────────────────────────────────────────
  getCommercials: async (): Promise<CommercialUser[]> => {
    const response = await axios.get(`${API_URL}/admin/commercials`, {
      headers: getAuthHeaders(),
    });
    const raw = response.data;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  },

  // ── PROJETS PUBLICS ──────────────────────────────────────────────────────────
  getPublishedProjects: async (): Promise<PublicProject[]> => {
    const response = await axios.get(`${API_URL}/projects/commercial/my-projects`, {
      headers: getAuthHeaders(),
    });
    const raw = response.data;
    const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return arr;
  },

  getProjectById: async (id: number): Promise<PublicProject> => {
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data || response.data;
  },

  registerSale: async (projectId: number, payload: RegisterSalePayload): Promise<ProjectSold> => {
    const response = await axios.post(
      `${API_URL}/projects/${projectId}/sold`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  
getMyCommissions: async (): Promise<Commission[]> => {
  const response = await axios.get(`${API_URL}/commercial/my-commissions`, {
    headers: getAuthHeaders(),
  });
  const raw = response.data;
  console.log("tous mes data", Array.isArray(raw) ? raw : Array.isArray(raw) ? raw : []);
  
  // return Array.isArray(raw) ? raw : Array.isArray(raw) ? raw : [];
  return raw;
},

  // Réponse API :
  // {
  //   success: true,
  //   data: [...],
  //   pagination: { total, perPage, currentPage, lastPage, from, to }
  // }
  getAllCommissions: async (payload: CommissionListPayload = {}): Promise<PaginatedCommissions> => {
    const response = await axios.post(
      `${API_URL}/admin/commissions/list`,
      { perPage: 50, page: 1, ...payload },
      { headers: jsonHeaders() }
    );
    const raw = response.data;
    return {
      data: Array.isArray(raw?.data) ? raw.data : [],
      meta: {
        total:    raw?.pagination?.total       ?? raw?.meta?.total    ?? 0,
        page:     raw?.pagination?.currentPage ?? raw?.meta?.page     ?? 1,
        perPage:  raw?.pagination?.perPage     ?? raw?.meta?.perPage  ?? 50,
        lastPage: raw?.pagination?.lastPage    ?? raw?.meta?.lastPage ?? 1,
      },
    };
  },

  // ── COMMISSIONS ADMIN — toutes les pages ─────────────────────────────────────
  getAllCommissionsFlat: async (payload: CommissionListPayload = {}): Promise<Commission[]> => {
    let all: Commission[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const res = await commercialService.getAllCommissions({ ...payload, perPage: 50, page });
      all = [...all, ...res.data];
      hasMore = page < res.meta.lastPage;
      page++;
    }
    return all;
  },

  createCommission: async (payload: CreateCommissionPayload): Promise<Commission> => {
    const response = await axios.post(
      `${API_URL}/admin/commissions`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  updateCommissionStatus: async (
    id: number,
    payload: UpdateCommissionStatusPayload
  ): Promise<Commission> => {
    const response = await axios.patch(
      `${API_URL}/admin/commissions/${id}/status`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  deleteCommission: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/admin/commissions/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  
  createPayment: async (payload: CreatePaymentPayload): Promise<CommissionPayment> => {
    const response = await axios.post(
      `${API_URL}/admin/payment-salespersons`,
      payload,
      { headers: jsonHeaders() }
    );
    return response.data.data || response.data;
  },

  getCommissionPayments: async (commissionId: number): Promise<CommissionPayment[]> => {
    const response = await axios.get(
      `${API_URL}/admin/commissions/${commissionId}/payments`,
      { headers: getAuthHeaders() }
    );
    const raw = response.data;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  },

  deletePayment: async (paymentId: number): Promise<void> => {
    await axios.delete(`${API_URL}/admin/payment-salespersons/${paymentId}`, {
      headers: getAuthHeaders(),
    });
  },
};

export default commercialService;