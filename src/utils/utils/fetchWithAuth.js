// utils/fetchWithAuth.js
import axios from 'axios';

/**
 * Wrapper for axios/fetch that checks for token errors and redirects to login if needed.
 * Usage: fetchWithAuth({ ...axiosConfig, router })
 */
export async function fetchWithAuth(config) {
  const { router, ...axiosConfig } = config;
  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (error) {
    // Check for token errors
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error || error.response.data?.message || '';
      if (
        status === 401 ||
        status === 403 ||
        errorMsg.toLowerCase().includes('token') ||
        errorMsg.toLowerCase().includes('jwt') ||
        errorMsg.toLowerCase().includes('unauthorized')
      ) {
        // Redirect to login page
        if (router) {
          router.push('/login');
        return null;
        } else if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return null;
      }
    }
    throw error;
  }
}
