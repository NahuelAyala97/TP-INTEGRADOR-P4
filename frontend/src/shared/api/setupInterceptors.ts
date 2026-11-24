import { api } from "./api";
import { useNotificationStore } from "@/store/notificationStore";

// Muestra una notificacion cuando el usuario no tiene permisos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      useNotificationStore.getState().showNotification("Acceso denegado");
    }

    return Promise.reject(error);
  },
);
