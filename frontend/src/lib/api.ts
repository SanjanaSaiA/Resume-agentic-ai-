/**
 * API Client for ResumeAI Backend
 * Handles all HTTP requests with authentication
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI operations
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (email: string, password: string) => {
        const response = await apiClient.post('/api/auth/register', { email, password });
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await apiClient.post('/api/auth/login', { email, password });
        return response.data;
    },
};

// Profile API
export const profileAPI = {
    get: async () => {
        const response = await apiClient.get('/api/profile');
        return response.data;
    },

    create: async (profileData: any) => {
        const response = await apiClient.post('/api/profile', profileData);
        return response.data;
    },

    update: async (profileData: any) => {
        const response = await apiClient.put('/api/profile', profileData);
        return response.data;
    },
};

// Resume API
export const resumeAPI = {
    generate: async (jobData: { job_url?: string; job_description?: string; job_title?: string; company_name?: string }) => {
        const response = await apiClient.post('/api/resume/generate', jobData);
        return response.data;
    },

    list: async () => {
        const response = await apiClient.get('/api/resume/list');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/api/resume/${id}`);
        return response.data;
    },
};

// Cover Letter API
export const coverLetterAPI = {
    generate: async (jobData: { job_url?: string; job_description?: string; job_title?: string; company_name?: string }) => {
        const response = await apiClient.post('/api/cover-letter/generate', jobData);
        return response.data;
    },

    list: async () => {
        const response = await apiClient.get('/api/cover-letter/list');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/api/cover-letter/${id}`);
        return response.data;
    },
};

// Gap Analysis API
export const gapAnalysisAPI = {
    analyze: async (jobData: { job_url?: string; job_description?: string; job_title?: string }) => {
        const response = await apiClient.post('/api/gap-analysis/analyze', jobData);
        return response.data;
    },

    list: async () => {
        const response = await apiClient.get('/api/gap-analysis/list');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/api/gap-analysis/${id}`);
        return response.data;
    },
};

// Health check
export const healthCheck = async () => {
    const response = await apiClient.get('/health');
    return response.data;
};

export default apiClient;
