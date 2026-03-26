// src/features/notifications/notificationsService.ts

import { ApiResponse } from "../../types";
import { apiRequest } from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/constants";


const notificationsService = {
  // Récupérer toutes les notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiRequest.get<ApiResponse<Notification[]>>(
      API_ENDPOINTS.NOTIFICATIONS
    );
    return response.data;
  },

  // Marquer comme lu
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiRequest.post<ApiResponse<Notification>>(
      API_ENDPOINTS.MARK_AS_READ(id)
    );
    return response.data;
  },

  // Marquer toutes comme lues
  markAllAsRead: async (): Promise<void> => {
    await apiRequest.post(API_ENDPOINTS.MARK_ALL_AS_READ);
  },
};

export default notificationsService;