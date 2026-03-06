// ─────────────────────────────────────────────────────────────────────────────
// components/ReviewScreen.tsx
// Photo review screen before upload — quality checklist + confirm/retake
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, DURATION, REVIEW_CHECKS, SCREEN } from '../constants/scanConfigs';
import type { ReviewScreenProps } from '../types/scan';

export const ReviewScreen: React.FC<ReviewScreenProps> = React.memo(
  ({ photo, onConfirm, onRetake, isLoading = false }) => {
    const slideUp = useRef(new Animated.Value(60)).current;
    const fade    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue:  1,
          duration: DURATION.REVIEW_ENTER,
          useNativeDriver: true,
        }),
        Animated.spring(slideUp, {
          toValue:  0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fade, slideUp]);

    return (
      <View style={styles.container}>
        {/* Full-bleed preview */}
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Captured bill photo"
        />

        {/* Top gradient + back button */}
        <LinearGradient
          colors={['rgba(10,12,16,0.9)', 'transparent']}
          style={styles.topGrad}
        >
          <SafeAreaView>
            <TouchableOpacity
              onPress={onRetake}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
              <Text style={styles.backLabel}>Retake</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Bottom panel */}
        <LinearGradient
          colors={['transparent', COLORS.bg]}
          style={styles.bottomGrad}
        >
          <Animated.View
            style={[
              styles.panel,
              { opacity: fade, transform: [{ translateY: slideUp }] },
            ]}
          >
            {/* Badge */}
            <View style={styles.badge}>
              <MaterialCommunityIcons name="receipt-text-check" size={16} color={COLORS.accent} />
              <Text style={styles.badgeText}>Ready to Scan</Text>
            </View>

            <Text style={styles.heading}>Review Your Bill</Text>
            <Text style={styles.sub}>
              Make sure the bill is clear, well-lit, and fully visible before sending.
            </Text>

            {/* Checklist */}
            <View style={styles.checks}>
              {REVIEW_CHECKS.map((tip) => (
                <View key={tip} style={styles.checkRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.checkText}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Upload button */}
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Send bill for parsing"
            >
              <LinearGradient
                colors={[COLORS.accentDim, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.uploadGrad}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.bg} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={COLORS.bg} />
                    <Text style={styles.uploadText}>Send for Parsing</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRetake}
              style={styles.retakeLink}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <Text style={styles.retakeLinkText}>Retake photo</Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  },
);

ReviewScreen.displayName = 'ReviewScreen';

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bg,
  },
  image: {
    width:  SCREEN.W,
    height: SCREEN.H,
  },
  topGrad: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   130,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: 20,
    paddingTop:    16,
    gap:           4,
  },
  backLabel: {
    color:      COLORS.text,
    fontSize:   16,
    fontWeight: '500',
  },
  bottomGrad: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    paddingTop: 80,
  },
  panel: {
    paddingHorizontal: 28,
    paddingBottom:     40,
  },
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    backgroundColor: 'rgba(0,229,200,0.12)',
    alignSelf:      'flex-start',
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:   20,
    marginBottom:   14,
    borderWidth:    1,
    borderColor:    'rgba(0,229,200,0.25)',
  },
  badgeText: {
    color:         COLORS.accent,
    fontSize:      12,
    fontWeight:    '600',
    letterSpacing: 0.4,
  },
  heading: {
    color:         COLORS.text,
    fontSize:      26,
    fontWeight:    '700',
    letterSpacing: -0.4,
    marginBottom:  8,
  },
  sub: {
    color:      COLORS.muted,
    fontSize:   14,
    lineHeight: 20,
    marginBottom: 20,
  },
  checks: {
    gap:          8,
    marginBottom: 28,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  checkText: {
    color:   COLORS.text,
    fontSize: 14,
    opacity:  0.9,
  },
  uploadBtn: {
    borderRadius: 16,
    overflow:     'hidden',
    marginBottom: 14,
  },
  uploadGrad: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap:            10,
  },
  uploadText: {
    color:      COLORS.bg,
    fontSize:   16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  retakeLink: {
    alignItems:     'center',
    paddingVertical: 6,
  },
  retakeLinkText: {
    color:      COLORS.muted,
    fontSize:   14,
    fontWeight: '500',
  },
});