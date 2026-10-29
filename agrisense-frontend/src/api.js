import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

export const getSensorData = () => api.get('/api/sensor-data');
export const simulate = () => api.post('/api/simulate');
export const predict = (data) => api.post('/api/predict', data);
export const getAlerts = () => api.get('/api/alerts');
export const login = (data) => api.post('/api/auth/login', data);
export const signup = (data) => api.post('/api/auth/signup', data);
export const uploadDataset = (data) => api.post('/api/dataset', data);
export const setCrop = (crop) => api.post('/api/crop', { crop });
export const getWeather = (location) => api.get('/api/weather', { params: { location } });

export default api;
