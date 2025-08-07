// =================================================================
// FICHIER : frontend/src/api/annonce.js
// VERSION GARANTIE CORRECTE
// =================================================================
import axios from 'axios';


const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
} );

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// --- Fonctions pour les annonces ---
export const createAnnonce = async (annonceData, isMultipart = false) => {
  const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/annonces', annonceData, config);
  return response.data;
};
export const getAnnonces = async (filters = {}) => {
  const response = await api.get('/annonces', { params: filters });
  return response.data;
};
export const getAnnonceById = async (id) => {
  const response = await api.get(`/annonces/${id}`);
  return response.data;
};
export const updateAnnonce = async (id, annonceData) => {
  const response = await api.put(`/annonces/${id}`, annonceData);
  return response.data;
};
export const deleteAnnonce = async (id) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/annonces/${id}`, {
    headers: { 'x-auth-token': token }
  });
  return response.data;
};

// --- Fonctions pour régions et villes (Logique corrigée) ---
export const getRegions = async () => {
  // Appelle GET http://localhost:5000/api/regions
  const response = await api.get('/regions' );
  return response.data;
};
export const getVillesByRegion = async (region) => {
  // Appelle GET http://localhost:5000/api/regions/villes/Tunis
  const response = await api.get(`/regions/villes/${encodeURIComponent(region )}`);
  return response.data;
};
export const getRegionDetails = async (region) => {
  // Appelle GET http://localhost:5000/api/regions/details/Tunis
  const response = await api.get(`/regions/details/${encodeURIComponent(region )}`);
  return response.data;
};

// --- Fonctions de géocodage ---
export const geocodeAddress = async (address) => {
  const response = await api.post('/annonces/geocode', { address });
  return response.data;
};
export const reverseGeocode = async (latitude, longitude) => {
  const response = await api.post('/annonces/reverse-geocode', { latitude, longitude });
  return response.data;
};

export default api;
