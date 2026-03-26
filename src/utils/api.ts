// src/utils/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// Configuration de base d'Axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.100.152:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête - Ajouter le token d'authentification
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs globalement
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ message: string }>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Gérer les erreurs d'authentification
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expirée. Veuillez vous reconnecter.');
      }

      // Gérer les erreurs de permission
      if (status === 403) {
        toast.error("Vous n'avez pas la permission d'effectuer cette action.");
      }

      // Gérer les erreurs serveur
      if (status >= 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
      }

      // Afficher le message d'erreur personnalisé
      if (data?.message) {
        toast.error(data.message);
      }
    } else if (error.request) {
      toast.error('Pas de réponse du serveur. Vérifiez votre connexion.');
    } else {
      toast.error('Une erreur est survenue.');
    }

    return Promise.reject(error);
  }
);

// Fonctions d'aide pour les requêtes
export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then((res) => res.data),
};

export default api;