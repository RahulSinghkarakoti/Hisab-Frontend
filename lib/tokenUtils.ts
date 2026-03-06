// Decode JWT payload without verifying signature (client side only)
const decodeJWT = (token: string): { exp?: number } | null => {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

// Returns true if token is still valid with a 30 second buffer
export const isTokenValid = (token: string): boolean => {
    try {

        const decoded = decodeJWT(token);
        if (!decoded?.exp) return false;

        const currentTime = Math.floor(Date.now() / 1000);
        const bufferSeconds = 30; // refresh 30s before actual expiry

        return decoded.exp > currentTime + bufferSeconds;
    } catch (error) {
        console.log('Error Occured during token validation', error);
        return false;
    }
};