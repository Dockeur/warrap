// src/features/auth/lotsService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.102:8000/api';

export interface Lot {
  id: number;
  name: string;
  role?: 'main' | 'child';
  description?: string;
}

export interface LotsResponse {
  success: boolean;
  data: Lot[];
}

const lotsService = {
  // Récupérer les lots principaux (main)
  getMainLots: async (): Promise<Lot[]> => {
    console.log('📋 LotsService - Récupération des lots principaux');
    try {
      const response = await axios.get<LotsResponse>(`${API_URL}/lots/main`, {
        headers: { Accept: 'application/json' },
      });
      console.log('✅ LotsService - Lots principaux:', response.data);
      const lots = response.data.data || response.data;
      return Array.isArray(lots) ? lots : [];
    } catch (error: any) {
      console.error('❌ LotsService - Erreur lots principaux:', error);
      throw new Error(error.response?.data?.message || 'Impossible de charger les lots principaux');
    }
  },

  // Récupérer les lots enfants selon le nom du lot principal
  getChildLots: async (mainLotName: string): Promise<Lot[]> => {
    console.log('📋 LotsService - Récupération des lots enfants pour:', mainLotName);
    try {
      const response = await axios.post<LotsResponse>(
        `${API_URL}/lots`,
        { name: mainLotName },
        { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
      );
      console.log('✅ LotsService - Lots enfants:', response.data);
      const lots = response.data.data || response.data;
      return Array.isArray(lots) ? lots : [];
    } catch (error: any) {
      console.error('❌ LotsService - Erreur lots enfants:', error);
      throw new Error(error.response?.data?.message || 'Impossible de charger les lots');
    }
  },
};

export default lotsService;