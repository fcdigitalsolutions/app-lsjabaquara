// src/services/api.js
import axios from 'axios';

const api_service = axios.create({
    baseURL: 'https://ls-jabaquara.app.br', // Defina a URL base da API
});

export default api_service;
