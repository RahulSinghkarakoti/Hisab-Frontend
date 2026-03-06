import { logger } from '@/lib/logger';
import storage, { plainStorage } from '@/store/storage'
import { User } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const tokenService = {
    async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
        await storage.set(ACCESS_TOKEN_KEY, accessToken)
        await storage.set(REFRESH_TOKEN_KEY, refreshToken)
    },
    async getAccessToken(): Promise<string | null> {
        return await storage.get(ACCESS_TOKEN_KEY);
    },

    async getRefreshToken(): Promise<string | null> {
        return await storage.get(REFRESH_TOKEN_KEY);
    },
    async saveUser(user: User): Promise<void> {
        if (!user) return;
        await plainStorage.set(USER_KEY, JSON.stringify(user));
        logger.success('User saved to storage', user);
    },
    async getUser(): Promise<User | null> {
        const user = await plainStorage.get(USER_KEY);
        const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
        return parsedUser
    },
    async clearTokens(): Promise<void> {
        await storage.remove(ACCESS_TOKEN_KEY)
        await storage.remove(REFRESH_TOKEN_KEY)
        await plainStorage.remove(USER_KEY)
        logger.info('All tokens and user data cleared');
    },
}