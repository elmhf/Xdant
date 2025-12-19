import { apiClient } from "./apiClient";

export const validateInvitation = async (token) => {
  try {
    const data = await apiClient("/api/clinics/validate-invitation", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: { error: error.message || "Erreur de connexion" } };
  }
};

export const acceptInvitation = async (token, NotificationId) => {
  try {
    const data = await apiClient("/api/clinics/accept-invitation", {
      method: "POST",
      body: JSON.stringify({ token, NotificationId }),
    });

    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: { error: error.message || "Erreur de connexion" } };
  }
};

export const rejectInvitation = async (token, NotificationId) => {
  try {
    const data = await apiClient("/api/clinics/reject-invitation", {
      method: "POST",
      body: JSON.stringify({ token, NotificationId }),
    });

    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: { error: error.message || "Erreur de connexion" } };
  }
};
