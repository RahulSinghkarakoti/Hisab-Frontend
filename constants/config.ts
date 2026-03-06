 // src/constants/config.js

export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.7:5000/api/v1'   // ← replace with your local IP (not localhost — RN runs on device)
  : 'https://your-production-domain.com/api/v1';

export const GOOGLE_CLIENT_ID_EXPO =
  'YOUR_EXPO_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID_ANDROID =
  'YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const GOOGLE_CLIENT_ID_IOS =
  'YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Token storage keys (SecureStore)
export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'hisab_access_token',
  REFRESH_TOKEN: 'hisab_refresh_token',
  USER:          'hisab_user',
  THEME:         'hisab_theme',
};

// API timeouts
export const REQUEST_TIMEOUT_MS = 15000;