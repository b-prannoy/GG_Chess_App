import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';
import type { User, UserProfile } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setupProfile: (data: Partial<UserProfile>) => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    error: null,

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authApi.login(email, password);

            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isAdmin: response.isAdmin || false,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    register: async (username: string, email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authApi.register(username, email, password);

            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isAdmin: false,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Registration failed',
                isLoading: false,
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
            });
        }
    },

    setupProfile: async (data: Partial<UserProfile>) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authApi.setupProfile(data);

            const updatedUser = { ...get().user, ...response.user } as User;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            set({
                user: updatedUser,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Profile update failed',
                isLoading: false,
            });
            throw error;
        }
    },

    loadStoredAuth: async () => {
        try {
            const [token, userStr] = await Promise.all([
                AsyncStorage.getItem('authToken'),
                AsyncStorage.getItem('user'),
            ]);

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
