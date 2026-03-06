import api from '../lib/axiosInstance'
import { tokenService } from './tokenService';
import { useAuthStore } from '../store/authStore';
import { User } from '@/types/auth';
import { logger } from '@/lib/logger';

interface LoginPayload {
    email: string;
    password: string;
}

interface SignupPayload {
    name: string;
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export const authService = {

    async login(payload: LoginPayload): Promise<void> {
        const { data: response } = await api.post<AuthResponse>('/auth/login', payload);
        await tokenService.saveTokens(response.data.accessToken, response.data.refreshToken);
        await tokenService.saveUser(response.data.user)
        useAuthStore.getState().setAuth(response.data.user, response.data.accessToken);
    },

    async signup(payload: SignupPayload): Promise<void> {
        const { data: response } = await api.post<AuthResponse>('/auth/signup', payload);
        await tokenService.saveTokens(response.data.accessToken, response.data.refreshToken);
        await tokenService.saveUser(response.data.user)
        useAuthStore.getState().setAuth(response.data.user, response.data.accessToken);
    },

    async logout(): Promise<void> {
        try {
            logger.info('Logout service Invoked')
            // Tell backend to invalidate the refresh token
            await api.post('/auth/logout');
        } catch {
            // Even if backend call fails, we still clear locally
        } finally {
            await tokenService.clearTokens();
            useAuthStore.getState().logout();
        }
    },
};