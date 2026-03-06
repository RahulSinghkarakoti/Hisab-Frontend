 
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';

import {
  CameraScreen,
  ReviewScreen,
  ScanningProgress,
  SuccessOverlay,
  ErrorScreen,
} from '../index';

import { useBillScanner } from '../../hooks/useBillScanner';
import { COLORS } from '../../constants/scanConfigs';

// ── Optional: pass authToken from your auth context ───────────────────────────
interface BillScannerScreenProps {
  authToken?: string;
  /** Called when user presses Close on the camera screen */
  onClose?: () => void;
}

export default function BillScannerScreen({
  authToken,
  onClose,
}: BillScannerScreenProps): React.JSX.Element {
  const {
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
  } = useBillScanner(authToken);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {phase === 'camera' && (
        <CameraScreen
          onCapture={handleCapture}
          onGalleryPick={handleGalleryPick}
          onClose={onClose}
        />
      )}

      {phase === 'review' && photo && (
        <ReviewScreen
          photo={photo}
          onConfirm={handleConfirm}
          onRetake={handleRetake}
        />
      )}

      {phase === 'scanning' && (
        <ScanningProgress />
      )}

      {phase === 'success' && (
        <SuccessOverlay
          onDone={handleDone}
          billId={uploadResult?.billId}
        />
      )}

      {phase === 'error' && error && (
        <ErrorScreen
          error={error}
          onRetry={handleRetry}
          onCancel={handleRetake}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },
});