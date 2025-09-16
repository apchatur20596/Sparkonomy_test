import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const baseURL = raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;

const api = axios.create({ baseURL });

export default api;
