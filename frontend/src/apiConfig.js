const getApiBaseUrl = () => {
  const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL
    || process.env.REACT_APP_API_BASE_URL
    || process.env.VITE_API_URL;

  if (configuredBackendUrl) {
    return configuredBackendUrl.replace(/\/$/, '');
  }

  return '';
};

export const API_BASE_URL = getApiBaseUrl();
