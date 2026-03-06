import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { tokenService } from "@/services/tokenService";
import { useAuthStore } from "@/store/authStore";
import { logger } from "./logger";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Track if we're already refreshing to prevent multiple refresh calls
let isRefreshing = false

// Queue requests that come in while refresh is in progress
let failedQueue: {
    resolve: (token: string) => void,
    reject: (error: unknown) => void,
}[] = []


const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error)
        else p.resolve(token!)
    });
    failedQueue = []
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
})

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        logger.info(`${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            body: config.data,
        });
        return config
    },
    (error) => {
        logger.error('Request setup failed', error);
        Promise.reject(error)
    }
)


api.interceptors.response.use(
    (response) => {
        logger.success(`${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
        });
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // ── Log the error details ──────────────────────────────────────────────
        logger.error(`${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            message: error.message,
            responseData: error.response?.data,
            code: error.code,           // e.g. ECONNABORTED for timeout
            isNetworkError: !error.response, // true = no internet / server unreachable
        });

        // ── Network error (no response at all) ────────────────────────────────
        if (!error.response) {
            logger.warn('Network unreachable or server is down');
        }

        // Only handle 401 errors, and only once per request (_retry flag)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                })
            }
            isRefreshing = true;

            try {
                const refreshToken = tokenService.getRefreshToken()
                if (!refreshToken) throw Error('No refresh Token Found')

                const { data:response } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
                console.log(response)
                const newAccessToken: string = response.data.accessToken

                useAuthStore.getState().setAccessToken(newAccessToken)
                await tokenService.saveTokens(newAccessToken, response.data.refreshToken ?? refreshToken)
                logger.success('Token refreshed successfully');
                processQueue(null, newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)

            } catch (refreshError) {
                console.error(refreshError)
                logger.error('Token refresh failed — logging out', refreshError);
                // Refresh failed — session is dead, log the user out
                processQueue(refreshError, null);
                await tokenService.clearTokens();
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;

            }
        }
        return Promise.reject(error);
    }
)

export default api