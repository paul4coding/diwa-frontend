import axios from 'axios';

const API_URL = 'http://localhost:8181'; 
//const API_URL = 'https://bitter-rules-beg.loca.lt'; // URL de base du backend

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour injecter le token dans chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // On vide le token s'il est expiré
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirection automatique vers login si on n'y est pas déjà
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
