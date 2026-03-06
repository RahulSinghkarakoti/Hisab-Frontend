import { ScanPhase,
  CapturedPhoto,
  UploadResult,
  ApiError,
  UseBillScannerReturn } from './../types/scan';
 import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { uploadBill } from '@/services/billApi';
import { validateCapturedPhoto } from '@/utils/scanValidation'; 

// ─────────────────────────────────────────────────────────────────────────────

export function useBillScanner( ): UseBillScannerReturn {
  const router = useRouter();

  const [phase,        setPhase]        = useState<ScanPhase>('camera');
  const [photo,        setPhoto]        = useState<CapturedPhoto | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error,        setError]        = useState<ApiError | null>(null);

  // Prevent double-submits
  const isUploading = useRef(false);

  // ── helpers ───────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setPhoto(null);
    setUploadResult(null);
    setError(null);
    isUploading.current = false;
  }, []);

  // ── Capture from camera ───────────────────────────────────────────────────

  const handleCapture = useCallback((captured: CapturedPhoto): void => {
    if (!captured?.uri) {
      console.warn('[BillScanner] handleCapture: received empty photo');
      return;
    }
    setPhoto(captured);
    setPhase('review');
  }, []);

  // ── Pick from gallery ─────────────────────────────────────────────────────

  const handleGalleryPick = useCallback((picked: CapturedPhoto): void => {
    if (!picked?.uri) {
      console.warn('[BillScanner] handleGalleryPick: received empty photo');
      return;
    }
    setPhoto(picked);
    setPhase('review');
  }, []);

  // ── Confirm & upload ──────────────────────────────────────────────────────

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (isUploading.current) return; // guard double-tap
    if (!photo) {
      console.error('[BillScanner] handleConfirm called without a photo');
      return;
    }

    // 1. Validate image before uploading
    const validation = await validateCapturedPhoto(photo);
    if (!validation.valid) {
      setError({
        code:      'INVALID_IMAGE',
        message:   validation.errors[0] ?? 'Image validation failed.',
        retryable: false,
      });
      setPhase('error');
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('[BillScanner] Image warnings:', validation.warnings);
    }

    // 2. Upload
    isUploading.current = true;
    setError(null);
    setPhase('scanning');

    try {
      const result = await uploadBill(photo);
      setUploadResult(result);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('success');
      } else {
        setError({
          code:      'PARSE_FAILED',
          message:   result.message ?? 'Bill parsing failed. Please try again.',
          retryable: true,
        });
        setPhase('error');
      }
    } catch (err) {
      // uploadBill should not throw, but guard anyway
      console.error('[BillScanner] Unexpected throw from uploadBill:', err);
      setError({
        code:      'UNKNOWN',
        message:   'An unexpected error occurred.',
        retryable: true,
      });
      setPhase('error');
    } finally {
      isUploading.current = false;
    }
  }, [photo]);

  // ── Retake ────────────────────────────────────────────────────────────────

  const handleRetake = useCallback((): void => {
    reset();
    setPhase('camera');
  }, [reset]);

  // ── Done (after success) ──────────────────────────────────────────────────

  const handleDone = useCallback((): void => {
    const billId = uploadResult?.billId;
    reset();

    if (billId) {
      router.replace(`/parsed-bill/${billId}`);
    } else {
      router.replace('/parsed-bill');
    }
  }, [uploadResult, reset, router]);

  // ── Retry (after error) ───────────────────────────────────────────────────

  const handleRetry = useCallback((): void => {
    if (error?.retryable && photo) {
      setPhase('review');
      setError(null);
    } else {
      handleRetake();
    }
  }, [error, photo, handleRetake]);

  // ─────────────────────────────────────────────────────────────────────────

  return {
    phase,
    photo,
    uploadResult,
    error,
    handleCapture,
    handleGalleryPick,
    handleConfirm,
    handleRetake,
    handleDone,
    handleRetry,
  };
}