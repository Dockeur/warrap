// src/features/applications/applicationsService.ts

import axios from "axios";
import { DashboardResponse, ProjectStatsParsed } from "../../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const applicationsService = {


  fetchWorker: async (): Promise<DashboardResponse> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get<DashboardResponse>(
        `${API_URL}/worker/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Stats non trouvées");
      } else if (error.response) {
        throw new Error(
          error.response.data.message ||
            "Erreur lors de la récupération des stats"
        );
      } else if (error.request) {
        throw new Error("Impossible de contacter le serveur");
      } else {
        throw error;
      }
    }
  },


  fetchWorkerProject: async (): Promise<ProjectStatsParsed> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.get<ProjectStatsParsed>(
        `${API_URL}/worker/accepted-projects `,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Stats non trouvées");
      } else if (error.response) {
        throw new Error(
          error.response.data.message ||
            "Erreur lors de la récupération des stats"
        );
      } else if (error.request) {
        throw new Error("Impossible de contacter le serveur");
      } else {
        throw error;
      }
    }
  },



};

export default applicationsService;
