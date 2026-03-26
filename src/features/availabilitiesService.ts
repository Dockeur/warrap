// src/services/availabilitiesService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interfaces
export interface Availability {
  id: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitiesResponse {
  success: boolean;
  data: Availability[];
}

export interface AvailabilityResponse {
  success: boolean;
  data: Availability;
}

export interface CreateAvailabilityData {
  start_date: string;
  end_date: string;
}

const availabilitiesService = {
  // Récupérer les disponibilités du worker connecté
  fetchAvailabilities: async (): Promise<Availability[]> => {
    console.log('📋 AvailabilitiesService - Récupération des disponibilités');
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get<AvailabilitiesResponse>(
        `${API_URL}/worker/availabilities `,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ AvailabilitiesService - Disponibilités récupérées:', response.data);

      const availabilities = response.data.data || response.data;
      
      if (!Array.isArray(availabilities)) {
        console.error('❌ AvailabilitiesService - Format de réponse invalide');
        return [];
      }

      return availabilities;
    } catch (error: any) {
      console.error('❌ AvailabilitiesService - Erreur lors de la récupération:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la récupération des disponibilités');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Créer une disponibilité
  createAvailability: async (
    availabilityData: CreateAvailabilityData
  ): Promise<Availability> => {
    console.log('➕ AvailabilitiesService - Création d\'une disponibilité');
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.post<AvailabilityResponse>(
        `${API_URL}/worker/availabilities`,
        availabilityData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ AvailabilitiesService - Disponibilité créée:', response.data);

      const availability = response.data.data || response.data;

      return availability;
    } catch (error: any) {
      console.error('❌ AvailabilitiesService - Erreur lors de la création:', error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : 'Erreur de validation');
      } else if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la création de la disponibilité');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },

  // Supprimer une disponibilité
  deleteAvailability: async (availabilityId: number): Promise<void> => {
    console.log(`🗑️ AvailabilitiesService - Suppression de la disponibilité #${availabilityId}`);
    
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.delete(
        `${API_URL}/worker/availabilities/${availabilityId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log(`✅ AvailabilitiesService - Disponibilité #${availabilityId} supprimée avec succès`);
    } catch (error: any) {
      console.error('❌ AvailabilitiesService - Erreur lors de la suppression:', error);

      if (error.response) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression de la disponibilité');
      } else if (error.request) {
        throw new Error('Impossible de contacter le serveur');
      } else {
        throw error;
      }
    }
  },
};

export default availabilitiesService;