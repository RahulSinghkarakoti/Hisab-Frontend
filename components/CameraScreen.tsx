 
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';

import { ScanOverlay } from './ScanOverlay';
import { useAnimatedScanner } from '../hooks/useAnimatedScanner';
import { COLORS,IMAGE_CONSTRAINTS } from '@/constants/scanConfigs';
import type { CapturedPhoto,CameraScreenProps } from '@/types/scan';

export const CameraScreen: React.FC<CameraScreenProps> = React.memo(
  ({ onCapture, onGalleryPick, onClose }) => {
    const cameraRef = useRef<InstanceType<typeof CameraView>>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const { shutterScale, triggerShutter } = useAnimatedScanner();

    // ── Capture ──────────────────────────────────────────────────────────────

    const handleCapture = useCallback(async () => {
      if (!cameraRef.current) return;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      triggerShutter();

      try {
        const raw = await cameraRef.current.takePictureAsync({
          quality:          IMAGE_CONSTRAINTS.CAPTURE_QUALITY,
          skipProcessing:   false,
          exif:             true,
        });

        if (!raw?.uri) {
          Alert.alert('Capture Error', 'No image was returned. Please try again.');
          return;
        }

        const photo: CapturedPhoto = {
          uri:    raw.uri,
          width:  raw.width,
          height: raw.height,
          exif:   raw.exif as Record<string, unknown> | undefined,
        };

        onCapture(photo);
      } catch (err) {
        console.error('[CameraScreen] takePictureAsync error:', err);
        Alert.alert('Camera Error', 'Could not capture photo. Please try again.');
      }
    }, [onCapture, triggerShutter]);

    // ── Gallery picker ────────────────────────────────────────────────────────

    const handleGallery = useCallback(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library in Settings.',
          [{ text: 'OK' }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:  ImagePicker.MediaTypeOptions.Images,
        quality:     IMAGE_CONSTRAINTS.CAPTURE_QUALITY,
        allowsEditing: false,
        exif:        true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.uri) return;

      const photo: CapturedPhoto = {
        uri:    asset.uri,
        width:  asset.width,
        height: asset.height,
      };

      onGalleryPick(photo);
    }, [onGalleryPick]);

    // ── Permission gate ───────────────────────────────────────────────────────

    if (!permission) {
      // Still loading permission status
      return <View style={styles.flex} />;
    }

    if (!permission.granted) {
      return (
        <View style={[styles.flex, styles.permCenter]}>
          <MaterialCommunityIcons name="camera-off" size={52} color={COLORS.muted} />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permSub}>
            Grant camera permission to scan bills.
          </Text>
          <TouchableOpacity
            style={styles.permBtn}
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Allow camera access"
          >
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // ── Camera view ───────────────────────────────────────────────────────────

    return (
      <View style={styles.flex}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />

        <ScanOverlay active />

        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Scan Bill</Text>

          <TouchableOpacity
            onPress={handleGallery}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Pick from gallery"
          >
            <Ionicons name="images-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {/* Gallery shortcut */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={handleGallery}
            accessibilityRole="button"
            accessibilityLabel="Open gallery"
          >
            <Ionicons name="image-outline" size={26} color={COLORS.text} />
            <Text style={styles.sideBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <Animated.View style={{ transform: [{ scale: shutterScale }] }}>
            <TouchableOpacity
              style={styles.shutter}
              onPress={handleCapture}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </Animated.View>

          {/* Flash placeholder */}
          <TouchableOpacity
            style={styles.sideBtn}
            accessibilityRole="button"
            accessibilityLabel="Toggle flash"
          >
            <Ionicons name="flash-outline" size={26} color={COLORS.text} />
            <Text style={styles.sideBtnLabel}>Flash</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

CameraScreen.displayName = 'CameraScreen';

const styles = StyleSheet.create({
  flex: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },

  // ── Header ──
  header: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop:     Platform.OS === 'android' ? 40 : 10,
    paddingBottom:  12,
  },
  headerBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: 'rgba(18,21,28,0.7)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  headerTitle: {
    color:         COLORS.text,
    fontSize:      16,
    fontWeight:    '600',
    letterSpacing: 0.3,
  },

  // ── Controls ──
  controls: {
    position:       'absolute',
    bottom:         0,
    left:           0,
    right:          0,
    height:         160,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom:  Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: 'rgba(10,12,16,0.75)',
  },
  shutter: {
    width:        76,
    height:       76,
    borderRadius: 38,
    borderWidth:  4,
    borderColor:  COLORS.accent,
    justifyContent: 'center',
    alignItems:   'center',
  },
  shutterInner: {
    width:        58,
    height:       58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
  },
  sideBtn: {
    alignItems: 'center',
    gap:        4,
  },
  sideBtnLabel: {
    color:      COLORS.muted,
    fontSize:   11,
    fontWeight: '500',
  },

  // ── Permission gate ──
  permCenter: {
    justifyContent: 'center',
    alignItems:     'center',
    gap:            12,
    paddingHorizontal: 36,
  },
  permTitle: {
    color:      COLORS.text,
    fontSize:   20,
    fontWeight: '700',
    marginTop:  8,
  },
  permSub: {
    color:      COLORS.muted,
    fontSize:   14,
    textAlign:  'center',
    lineHeight: 20,
  },
  permBtn: {
    marginTop:       12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 28,
    paddingVertical:   14,
    borderRadius:    14,
  },
  permBtnText: {
    color:      COLORS.bg,
    fontSize:   15,
    fontWeight: '700',
  },
});