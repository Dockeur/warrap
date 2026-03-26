// src/features/observations/observationsService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interfaces
export interface Observation {
  id: number;
  name: string;
  description: string;
  critical: 'warning' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
}

export interface ObservationsResponse {
  success: boolean;
  data: Observation[];
}

export interface ObservationResponse {
  success: boolean;
  data: Observation;
}

export interface CreateObservationData {
  name: string;
  description: string;
  critical: 'warning' | 'rejected' | 'accepted';
}

export interface UpdateObservationData {
  critical?: 'warning' | 'rejected' | 'accepted';
  description?: string;
}

const observationsService = {
  // Récupérer les observations d'un projet
  fetchObservations: async (projectId: number | string): Promise<Observation[]> => {
    console.log(`📋 ObservationsService - Récupération des observations du projet #${projectId}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get<ObservationsResponse>(
        `${API_URL}/projects/${projectId}/observations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ ObservationsService - Observations récupérées:', response.data);

      const observations = response.data.data || response.data;
      
      if (!Array.isArray(observations)) {
        console.error('❌ ObservationsService - Format de réponse invalide');
        return [];
      }

      return observations;
    } catch (error: any) {
      console.error('❌ ObservationsService - Erreur lors de la récupération:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération des observations');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Créer une observation
  createObservation: async (
    projectId: number | string, 
    observationData: CreateObservationData
  ): Promise<Observation> => {
    console.log(`➕ ObservationsService - Création d'une observation pour le projet #${projectId}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.post<ObservationResponse>(
        `${API_URL}/projects/${projectId}/observations`,
        observationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ ObservationsService - Observation créée:', response.data);

      const observation = response.data.data || response.data;

      return observation;
    } catch (error: any) {
      console.error('❌ ObservationsService - Erreur lors de la création:', error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : 'Erreur de validation');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la création de l\'observation');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Mettre à jour une observation
  updateObservation: async (
    projectId: number | string,
    observationId: number,
    observationData: UpdateObservationData
  ): Promise<Observation> => {
    console.log(`✏️ ObservationsService - Mise à jour de l'observation #${observationId}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.patch<ObservationResponse>(
        `${API_URL}/projects/${projectId}/observations/${observationId}`,
        observationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ ObservationsService - Observation mise à jour:', response.data);

      const observation = response.data.data || response.data;

      return observation;
    } catch (error: any) {
      console.error('❌ ObservationsService - Erreur lors de la mise à jour:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la mise à jour de l\'observation');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Supprimer une observation
  deleteObservation: async (
    projectId: number | string,
    observationId: number
  ): Promise<void> => {
    console.log(`🗑️ ObservationsService - Suppression de l'observation #${observationId}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.delete(
        `${API_URL}/projects/${projectId}/observations/${observationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(`✅ ObservationsService - Observation #${observationId} supprimée avec succès`);
    } catch (error: any) {
      console.error('❌ ObservationsService - Erreur lors de la suppression:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression de l\'observation');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },
};

export default observationsService;