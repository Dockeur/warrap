import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    project?: { id: number; name: string; uuid?: string; status?: string; };
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at?: string;
}

export interface EnginNotification {
    id: number;
    project_id: number;
    project_name?: string;
    project?: { id: number; name: string; uuid?: string; status?: string; };
    task?: string;
    start_at?: string;
    end_at?: string;
    message?: string;
    status: 'pending' | 'accepted' | 'refused';
    created_at: string;
    updated_at?: string;
}

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
    project?: { id: number; name: string; uuid?: string; status: string; amount?: string; started_at?: string; ended_at?: string | null; };
    task?: string;
    note?: string | null;
    start_at?: string | null;
    end_at?: string | null;
    assigned_at?: string;
}

export interface UserProfile {
    id: number;
    email: string | null;
    user_type: 'worker' | 'engin';
    profil: string | null;
    nationalIDCard: string | null;
    roles: string[];
    privacy_policy: boolean;
    created_at: string;
    account: {
        child_lot_name: string | null;
        parent_lot_name: string | null;
        all_lots: any[];
        is_enterprise: boolean;
        years_of_experience: number;
        presentation: string | null;
        account_status: string;
    } | null;
    contact: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string | null;
        localisation: string | null;
    } | null;
    enterprise_documents?: {
        commercial_register: string | null;
        immigration_certificate: string | null;
        certificate_of_compliance: string | null;
        approval: string | null;
        patent: string | null;
    } | null;
    engin_documents?: {
        registration_document: string | null;
        purchase_invoice: string | null;
        last_gear_report: string | null;
    } | null;
}

export interface CompleteWorkerProfileData {
    profil: File;
    nationalIDCard: File;
    worker_user_ids?: string;
    years_of_experience?: number;
    presentation?: string;
    commercial_register?: File | null;
    immigration_certificate?: File | null;
    certificate_of_compliance?: File | null;
    approval?: File | null;
    patent?: File | null;
}

export interface CompleteEnginProfileData {
    profil: File;
    nationalIDCard: File;
    registration_document: File;
    purchase_invoice: File;
    last_gear_report: File;
}

export type NotificationResponse = 'accepted' | 'rejected';
export type EnginNotificationResponse = 'accepted' | 'refused';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token d'authentification manquant");
    return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
};

const jsonHeaders = () => ({ ...authHeaders(), 'Content-Type': 'application/json' });

const handleError = (error: any, context: string): never => {
    if (error.response?.status === 401) throw new Error('Non autorisé. Veuillez vous reconnecter.');
    if (error.response?.status === 403) throw new Error('Accès refusé.');
    if (error.response) throw new Error(error.response.data?.message || `Erreur lors de ${context}`);
    if (error.request) throw new Error('Impossible de contacter le serveur');
    throw error;
};

const workerService = {

    getUserProfile: async (): Promise<UserProfile> => {
        try {
            const { data } = await axios.get(`${API_URL}/user/profile`, { headers: authHeaders() });
            return data.data;
        } catch (error: any) { handleError(error, 'récupération du profil'); }
    },

    fetchWorkerStats: async (): Promise<WorkerStats> => {
        try {
            const { data } = await axios.get(`${API_URL}/worker/stats`, { headers: authHeaders() });
            return data.data;
        } catch (error: any) { handleError(error, 'récupération des statistiques'); }
    },

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
            const { data } = await axios.get(`${API_URL}/worker/recent-projects`, { headers: authHeaders(), params: { limit: 5 } });
            return data.data ?? [];
        } catch (error: any) { handleError(error, 'récupération des projets récents'); }
    },

    fetchMyProjects: async (): Promise<MyProject[]> => {
        try {
            const { data } = await axios.get(`${API_URL}/worker/my-projects`, { headers: authHeaders() });
            return Array.isArray(data) ? data : (data.data ?? []);
        } catch (error: any) { handleError(error, 'récupération de mes projets'); }
    },

    fetchWorkerAvailabilities: async (): Promise<WorkerAvailability[]> => {
        try {
            const { data } = await axios.get(`${API_URL}/worker/availabilities`, { headers: authHeaders() });
            return data.data ?? [];
        } catch (error: any) { handleError(error, 'récupération des disponibilités'); }
    },

    fetchMyNotifications: async (): Promise<WorkerNotification[]> => {
        try {
            const { data } = await axios.get(`${API_URL}/worker/my-notifications`, { headers: authHeaders() });
            return Array.isArray(data) ? data : (data.data ?? []);
        } catch (error: any) { handleError(error, 'récupération des notifications'); }
    },

    respondToNotification: async (id: number, status: NotificationResponse): Promise<WorkerNotification> => {
        try {
            const { data } = await axios.patch(`${API_URL}/worker/notifications/${id}/respond`, { status }, { headers: jsonHeaders() });
            return data.data ?? data;
        } catch (error: any) { handleError(error, 'réponse à la notification'); }
    },

    fetchEnginNotifications: async (): Promise<EnginNotification[]> => {
        try {
            const { data } = await axios.get(`${API_URL}/engin/my-notifications`, { headers: authHeaders() });
            return Array.isArray(data) ? data : (data.data ?? []);
        } catch (error: any) { handleError(error, 'récupération des notifications engin'); }
    },

    respondToEnginNotification: async (id: number, status: EnginNotificationResponse): Promise<EnginNotification> => {
        try {
            const { data } = await axios.patch(`${API_URL}/engin/notifications/${id}/respond`, { status }, { headers: jsonHeaders() });
            return data.data ?? data;
        } catch (error: any) { handleError(error, 'réponse à la notification engin'); }
    },

    completeWorkerProfile: async (profileData: CompleteWorkerProfileData): Promise<any> => {
        try {
            const fd = new FormData();
            fd.append('profil', profileData.profil);
            fd.append('nationalIDCard', profileData.nationalIDCard);
            if (profileData.worker_user_ids) fd.append('worker_user_ids', profileData.worker_user_ids);
            if (profileData.years_of_experience !== undefined) fd.append('years_of_experience', String(profileData.years_of_experience));
            if (profileData.presentation) fd.append('presentation', profileData.presentation);
            if (profileData.commercial_register) fd.append('commercial_register', profileData.commercial_register);
            if (profileData.immigration_certificate) fd.append('immigration_certificate', profileData.immigration_certificate);
            if (profileData.certificate_of_compliance) fd.append('certificate_of_compliance', profileData.certificate_of_compliance);
            if (profileData.approval) fd.append('approval', profileData.approval);
            if (profileData.patent) fd.append('patent', profileData.patent);
            const { data } = await axios.post(`${API_URL}/worker/complete-profile`, fd, {
                headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
            });
            return data;
        } catch (error: any) { handleError(error, 'complétion du profil worker'); }
    },

    completeEnginProfile: async (profileData: CompleteEnginProfileData): Promise<any> => {
        try {
            const fd = new FormData();
            fd.append('profil', profileData.profil);
            fd.append('nationalIDCard', profileData.nationalIDCard);
            fd.append('registration_document', profileData.registration_document);
            fd.append('purchase_invoice', profileData.purchase_invoice);
            fd.append('last_gear_report', profileData.last_gear_report);
            const { data } = await axios.post(`${API_URL}/engin/complete-profile`, fd, {
                headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
            });
            return data;
        } catch (error: any) { handleError(error, 'complétion du profil engin'); }
    },

    removeWorkerFromProject: async (projectId: number, userId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}/workers/${userId}`, { headers: authHeaders() });
        } catch (error: any) { handleError(error, 'retrait du worker du projet'); }
    },

    removeEnginFromProject: async (projectId: number, pivotId: number): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/project-users/${pivotId}`, { headers: authHeaders() });
        } catch (error: any) { handleError(error, "retrait de l'engin du projet"); }
    },
};

export default workerService;