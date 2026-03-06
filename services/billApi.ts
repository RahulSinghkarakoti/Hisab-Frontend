import type { ApiError, ApiErrorCode, CapturedPhoto, CloudinarySignature, CloudinaryUploadResponse, UploadResult } from './../types/scan';
import { UPLOAD } from './../constants/scanConfigs';
import { isRecord } from '@/utils/scanValidation';
import api from '@/lib/axiosInstance';
import cloudinaryApi from '@/lib/cloudinaryInstance';
import { logger } from '@/lib/logger';
// ── Internal helpers ──────────────────────────────────────────────────────────

function makeApiError(
    code: ApiErrorCode,
    message: string,
    retryable = false,
): ApiError {
    return { code, message, retryable };
}


// ── Main upload function ──────────────────────────────────────────────────────

/**
 * Uploads the captured bill image to the parsing server.
 *
 * @throws Never — returns UploadResult with success:false on any failure.
 *
 * Replace `UPLOAD.ENDPOINT` in constants/index.ts with your real URL.
 * The server must respond with JSON: `{ success: boolean, billId?: string, ... }`
 */

export async function uploadBill(
    photo: CapturedPhoto,
): Promise<UploadResult> {
    let lastError: ApiError = makeApiError('UNKNOWN', 'Unknown error', true);
    for (let attempt = 1; attempt <= UPLOAD.MAX_RETRIES + 1; attempt++) {
        try {
            return await attemptUpload(photo);
        } catch (err) {
            lastError = classifyError(err);
            // Don't retry non-retryable errors
            if (!lastError.retryable) break;
            // Don't retry on the last attempt
            if (attempt <= UPLOAD.MAX_RETRIES) {
                // Exponential back-off: 1s, 2s
                await sleep(1000 * attempt);
            }
        }
    }

    return { success: false, message: lastError.message };
}

async function attemptUpload(
    photo: CapturedPhoto,
    authToken?: string,
): Promise<UploadResult> {
    // ── Step 1: Get signature ────────────────────────────────────────────────
    const sig = await getSignature();

    // ── Step 2: Build FormData ───────────────────────────────────────────────
    const formData = new FormData();
    formData.append('file', {          // Cloudinary expects 'file', not 'bill'
        uri: photo.uri,
        name: `bill_${Date.now()}.jpg`,  // unique per upload
        type: 'image/jpeg',
    } as unknown as Blob);

    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    // ── Step 3: Upload to Cloudinary ─────────────────────────────────────────
    // Cloudinary is a different base URL — use cloudinaryApi, not api
    // axios throws on 4xx/5xx automatically, no manual .ok check needed
    let cloudinaryData: CloudinaryUploadResponse;

    try {
        const { data } = await cloudinaryApi.post<CloudinaryUploadResponse>(
            `${sig.cloudName}/image/upload`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                transformRequest: (d) => d,
            }
        );
        cloudinaryData = data;
    } catch (err: any) {
        // Cloudinary 4xx errors (bad signature, invalid image, etc.)
        const status = err?.response?.status;
        if (status === 400 || status === 422) {
            throw makeApiError('INVALID_IMAGE', 'Cloudinary rejected the image.', false);
        }
        throw makeApiError('NETWORK_ERROR', 'Upload to Cloudinary failed.', true);
    }

    logger.info('Cloudinary upload success', {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        bytes: cloudinaryData.bytes,
    });

    // ── Step 4: Register bill with your server ───────────────────────────────
    const { data: billData } = await api.post<{ billId: string }>('/bills', {
        cloudinaryUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        bytes: cloudinaryData.bytes,
    });

    return {
        success: true,
        billId: billData.billId,
    };
}


// ---- get upload signature----
async function getSignature(): Promise<CloudinarySignature> {
    const { data: response } = await api.get<any>('/upload/signature')
    console.log('Full response data:', JSON.stringify(response, null, 2));
    return response?.data;
}

// ── Response parser ───────────────────────────────────────────────────────────

function parseServerResponse(raw: unknown): UploadResult {
    if (!isRecord(raw)) {
        return { success: false, message: 'Unexpected server response format.' };
    }

    const success = raw['success'] === true;

    const billId =
        typeof raw['billId'] === 'string' ? raw['billId'] :
            typeof raw['bill_id'] === 'string' ? raw['bill_id'] :
                undefined;

    const message =
        typeof raw['message'] === 'string' ? raw['message'] : undefined;

    // Minimal parsed data extraction (extend as needed)
    const data = isRecord(raw['data'])
        ? {
            billId: billId ?? '',
            vendor: typeof raw['data']['vendor'] === 'string' ? raw['data']['vendor'] : undefined,
            date: typeof raw['data']['date'] === 'string' ? raw['data']['date'] : undefined,
            total: typeof raw['data']['total'] === 'number' ? raw['data']['total'] : undefined,
            currency: typeof raw['data']['currency'] === 'string' ? raw['data']['currency'] : undefined,
        }
        : undefined;

    return { success, billId, message, data };
}

// ── Error classifier ──────────────────────────────────────────────────────────

function classifyError(err: unknown): ApiError {
    // Already typed as ApiError
    if (isRecord(err) && typeof err['code'] === 'string') {
        return err as unknown as ApiError;
    }

    if (err instanceof Error) {
        if (err.name === 'AbortError') {
            return makeApiError('TIMEOUT', 'Request timed out. Check your connection.', true);
        }
        if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
            return makeApiError('NETWORK_ERROR', 'No internet connection. Please try again.', true);
        }
    }

    return makeApiError('UNKNOWN', 'Something went wrong. Please try again.', true);
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}