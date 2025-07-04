// API Configuration
// Change this URL when switching to a different device or environment
export const API_BASE_URL = 'http://localhost:3000';

// Helper functions for making API calls
export const getApiUrl = (endpoint) => {
    // Ensure endpoint starts with '/' for consistency
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${formattedEndpoint}`;
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: getApiUrl('/api/user/login'),
    REGISTER: getApiUrl('/api/user/register'),
    PROFILE: getApiUrl('/api/user/profile'),
};

// Alert endpoints
export const ALERT_ENDPOINTS = {
    CREATE: getApiUrl('/api/alert'),
    GET_ALL: getApiUrl('/api/alert'),
    UPDATE: (id) => getApiUrl(`/api/alert/${id}`),
};

// Contact endpoints
export const CONTACT_ENDPOINTS = {
    CREATE: getApiUrl('/api/contact'),
    GET_ALL: getApiUrl('/api/contact'),
    DELETE: (id) => getApiUrl(`/api/contact/${id}`),
};

export default {
    API_BASE_URL,
    getApiUrl,
    AUTH_ENDPOINTS,
    ALERT_ENDPOINTS,
    CONTACT_ENDPOINTS,
}; 