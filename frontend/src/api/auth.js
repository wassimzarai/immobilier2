// Contenu pour : src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = (userData ) => axios.post(`${API_URL}/register`, userData);
export const activate = (activationData) => axios.post(`${API_URL}/activate`, activationData);
export const login = (credentials) => axios.post(`${API_URL}/login`, credentials);
