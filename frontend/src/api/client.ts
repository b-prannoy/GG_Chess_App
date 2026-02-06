import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse, FeedResponse, CommentsResponse, Reel, Comment, User, ChessGame } from '../types';

// API Base URL - change to your actual backend URL
const API_BASE_URL = 'http://10.0.2.2:5000'; // Android emulator localhost
// For iOS simulator, use: 'http://localhost:5000'
// For physical device, use your machine's IP: 'http://192.168.x.x:5000'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - could trigger logout here
            AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============

export const authApi = {
    register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    setupProfile: async (data: {
        name?: string;
        avatarUrl?: string;
        bio?: string;
        chessRating?: number;
    }): Promise<{ message: string; user: User }> => {
        const response = await api.put('/auth/setup-profile', data);
        return response.data;
    },

    deleteAccount: async (): Promise<{ message: string }> => {
        const response = await api.delete('/auth/delete-account');
        return response.data;
    },
};

// ============ REELS API ============

export const reelsApi = {
    getFeed: async (page = 1, limit = 10): Promise<FeedResponse> => {
        const response = await api.get('/reels', { params: { page, limit } });
        return response.data;
    },

    getRandomReels: async (limit = 10): Promise<{ success: boolean; data: Reel[]; count: number }> => {
        const response = await api.get('/reels/random', { params: { limit } });
        return response.data;
    },

    getAvailableGames: async (): Promise<{ success: boolean; data: ChessGame[]; count: number }> => {
        const response = await api.get('/reels/games');
        return response.data;
    },

    getReelsByGame: async (gameId: string, page = 1, limit = 10) => {
        const response = await api.get(`/reels/game/${gameId}`, { params: { page, limit } });
        return response.data;
    },

    viewReel: async (reelId: string): Promise<{ success: boolean; message: string; views: number }> => {
        const response = await api.post(`/reels/${reelId}/view`);
        return response.data;
    },

    getReelStats: async (reelId: string) => {
        const response = await api.get(`/reels/${reelId}/stats`);
        return response.data;
    },

    likeReel: async (reelId: string): Promise<{ success: boolean; message: string; likes: number }> => {
        const response = await api.post(`/reels/${reelId}/like`);
        return response.data;
    },

    unlikeReel: async (reelId: string): Promise<{ success: boolean; message: string; likes: number }> => {
        const response = await api.post(`/reels/${reelId}/unlike`);
        return response.data;
    },

    getComments: async (reelId: string): Promise<CommentsResponse> => {
        const response = await api.get(`/reels/${reelId}/comments`);
        return response.data;
    },

    createComment: async (
        reelId: string,
        text: string,
        parentCommentId?: string
    ): Promise<{ success: boolean; message: string; data: Comment }> => {
        const response = await api.post(`/reels/${reelId}/comments`, { text, parentCommentId });
        return response.data;
    },

    deleteComment: async (
        reelId: string,
        commentId: string
    ): Promise<{ success: boolean; message: string; deletedCount: number }> => {
        const response = await api.delete(`/reels/${reelId}/comments/${commentId}`);
        return response.data;
    },
};

export default api;
