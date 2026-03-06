import { ImageValidationOptions ,CapturedPhoto, ValidationResult} from './../types/scan';
import * as FileSystem from 'expo-file-system';
import { IMAGE_CONSTRAINTS } from '@/constants/scanConfigs';

/**
 * Validates a captured photo URI.
 * Checks: URI format, file existence, file size, and optionally dimensions.
 */
export async function validateCapturedPhoto(
  photo: CapturedPhoto,
  options: ImageValidationOptions = {},
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    minBytes      = IMAGE_CONSTRAINTS.MIN_BYTES,
    maxBytes      = IMAGE_CONSTRAINTS.MAX_BYTES,
    minDimension  = IMAGE_CONSTRAINTS.MIN_DIMENSION,
  } = options;

  // 1. URI presence & basic format
  if (!photo.uri || typeof photo.uri !== 'string') {
    errors.push('Image URI is missing or invalid.');
    return { valid: false, errors, warnings };
  }

  const uri = photo.uri.trim();

  if (!uri.startsWith('file://') && !uri.startsWith('content://') && !uri.startsWith('ph://')) {
    warnings.push('Unexpected URI scheme – image may not be accessible.');
  }

  // 2. File existence & size (skip for content:// URIs on Android — FileSystem can't stat them)
  if (!uri.startsWith('content://')) {
    try {
      const info = await FileSystem.getInfoAsync(uri);

      if (!info.exists) {
        errors.push('Image file does not exist on device.');
        return { valid: false, errors, warnings };
      }

      const size = (info as FileSystem.FileInfo & { size?: number }).size ?? 0;

      if (size < minBytes) {
        errors.push(`Image file is too small (${formatBytes(size)}). It may be corrupt.`);
      }

      if (size > maxBytes) {
        errors.push(`Image file is too large (${formatBytes(size)}). Maximum is ${formatBytes(maxBytes)}.`);
      }
    } catch {
      warnings.push('Could not verify file size — proceeding with caution.');
    }
  }

  // 3. Dimension check (if available from camera/picker)
  if (photo.width !== undefined && photo.height !== undefined) {
    const minSide = Math.min(photo.width, photo.height);
    if (minSide < minDimension) {
      errors.push(
        `Image resolution too low (${photo.width}×${photo.height}px). ` +
        `Minimum is ${minDimension}px on the short side.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that a string URI is non-empty and well-formed.
 * Lightweight synchronous check (no file I/O).
 */
export function isValidUri(uri: unknown): uri is string {
  return (
    typeof uri === 'string' &&
    uri.trim().length > 0 &&
    (uri.startsWith('file://') ||
      uri.startsWith('content://') ||
      uri.startsWith('ph://') ||
      uri.startsWith('http://') ||
      uri.startsWith('https://'))
  );
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Ensures a value is a non-null object (type guard).
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}