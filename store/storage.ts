import { logger } from '@/lib/logger';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
    async get(key: string) {
        try {
            const value = await SecureStore.getItemAsync(key);
            if (!value) return null;
            try {
                return JSON.parse(value);
            } catch { return value; }
        } catch {
            return null;
        }
    },

    async set(key: string, value: any) {
        try {
            const str = typeof value === 'string' ? value : JSON.stringify(value);
            logger.success('refresh token saved successfully', value);

            await SecureStore.setItemAsync(key, str);
            return true;
        } catch {
            return false;
        }
    },

    async remove(key: string) {
        try {
            await SecureStore.deleteItemAsync(key);
            return true;
        } catch {
            return false;
        }
    },

    async clear(keys = []) {
        await Promise.all(keys.map((k) => this.remove(k)));
    },
};

// ── AsyncStorage wrapper (user object — not sensitive, can be large) ──────────
const plainStorage = {

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(key);
            console.log('plainStorage.get raw:', key, raw); // ← add this
            if (!raw || raw === 'null' || raw === 'undefined') return null;
            return JSON.parse(raw) as T;
        } catch (e) {
            console.log('plainStorage.get error:', e);
            return null;
        }
    },

    async set(key: string, value: unknown): Promise<boolean> {
        try {
            if (value === null || value === undefined) return false;
            await AsyncStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch { }
    },
};

export { plainStorage }
export default storage;