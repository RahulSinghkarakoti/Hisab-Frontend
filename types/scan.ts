export type ScanPhase = 'camera' | 'review' | 'scanning' | 'success' | 'error';

export interface CapturedPhoto {
  /** Local file URI from expo-camera / expo-image-picker */
  uri: string;
  /** Width in pixels (may be undefined from older expo versions) */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** EXIF metadata, if available */
  exif?: Record<string, unknown>;
}


export interface UploadResult {
  success: boolean;
  /** Optional server-assigned job/bill ID */
  billId?: string;
  /** Human-readable message from server */
  message?: string;
  /** Parsed bill data, if server returns it immediately */
  data?: ParsedBillData;
}

export interface ParsedBillData {
  billId: string;
  vendor?: string;
  date?: string;
  total?: number;
  currency?: string;
  lineItems?: LineItem[];
  rawText?: string;
}

export interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

// ── Network / API ─────────────────────────────────────────────────────────────

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  retryable: boolean;
}

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'INVALID_IMAGE'
  | 'PARSE_FAILED'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImageValidationOptions {
  /** Minimum file size in bytes */
  minBytes?: number;
  /** Maximum file size in bytes */
  maxBytes?: number;
  /** Minimum image dimension (width or height) in pixels */
  minDimension?: number;
  /** Allowed MIME types */
  allowedTypes?: string[];
}

// ── Component Props ───────────────────────────────────────────────────────────

export interface ScanOverlayProps {
  active: boolean;
}

export interface ScanningProgressProps {
  /** 0–1 progress value */
  progress?: number;
}

export interface SuccessOverlayProps {
  onDone: () => void;
  billId?: string;
}

export interface ReviewScreenProps {
  photo: CapturedPhoto;
  onConfirm: () => void;
  onRetake: () => void;
  isLoading?: boolean;
}

export interface CameraScreenProps {
  onCapture: (photo: CapturedPhoto) => void;
  onGalleryPick: (photo: CapturedPhoto) => void;
  onClose?: () => void;
}

export interface ErrorScreenProps {
  error: ApiError;
  onRetry: () => void;
  onCancel: () => void;
}

// ── Hook Return Types ─────────────────────────────────────────────────────────

export interface UseBillScannerReturn {
  phase: ScanPhase;
  photo: CapturedPhoto | null;
  uploadResult: UploadResult | null;
  error: ApiError | null;
  handleCapture: (photo: CapturedPhoto) => void;
  handleGalleryPick: (photo: CapturedPhoto) => void;
  handleConfirm: () => Promise<void>;
  handleRetake: () => void;
  handleDone: () => void;
  handleRetry: () => void;
}

export interface UseAnimatedScannerReturn {
  shutterScale: import('react-native').Animated.Value;
  triggerShutter: () => void;
}

export interface CloudinarySignature {
  signature:  string;
  timestamp:  number;
  folder:     string;
  apiKey:     string;
  cloudName:  string;
}

export interface CloudinaryUploadResponse {
  public_id:   string;
  secure_url:  string;
  width:       number;
  height:      number;
  bytes:       number;
  format:      string;
  resource_type: string;
}