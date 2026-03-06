// src/lib/logger.ts
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  success: (message: string, data?: unknown) => {
    if (!isDev) return;
    console.log(
      `✅ [API SUCCESS] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  },

  error: (message: string, details?: unknown) => {
    if (!isDev) return;
    console.error(
      `❌ [API ERROR] ${message}`,
      details ? JSON.stringify(details, null, 2) : ''
    );
  },

  warn: (message: string, data?: unknown) => {
    if (!isDev) return;
    console.warn(
      `⚠️ [API WARN] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  },

  info: (message: string, data?: unknown) => {
    if (!isDev) return;
    console.info(
      `ℹ️ [API INFO] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  },
};