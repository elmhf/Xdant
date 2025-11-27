export const validateInvitation = async (token) => {
  try {
    const response = await fetch("http://localhost:5000/api/clinics/validate-invitation", {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, error: "Erreur de connexion" };
  }
};

export const acceptInvitation = async (token,NotificationId) => {
  try {
    const response = await fetch("http://localhost:5000/api/clinics/accept-invitation", {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token,NotificationId }),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, error: "Erreur de connexion" };
  }
};

export const rejectInvitation = async (token,NotificationId) => {
  try {
    const response = await fetch("http://localhost:5000/api/clinics/reject-invitation", {
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token,NotificationId }),
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, error: "Erreur de connexion" };
  }
};
