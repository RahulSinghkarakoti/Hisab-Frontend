// ─────────────────────────────────────────────────────────────────────────────
// components/ScanningProgress.tsx
// Full-screen "server is parsing" overlay with spinner, steps, progress bar
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, DURATION, SCAN_STEPS } from '../constants/scanConfigs';
import type { ScanningProgressProps } from '../types/scan';

export const ScanningProgress: React.FC<ScanningProgressProps> = React.memo(({ progress }) => {
  const spin  = useRef(new Animated.Value(0)).current;
  const bar   = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  const [stepIdx, setStepIdx] = useState<number>(0);

  useEffect(() => {
    // Spinner
    const spinAnim = Animated.loop(
      Animated.timing(spin, {
        toValue:  1,
        duration: DURATION.SPINNER_ROTATE,
        easing:   Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Progress bar — driven by `progress` prop if provided, else auto-animated
    const barTarget = progress !== undefined ? progress : 0.92;
    const barAnim = Animated.timing(bar, {
      toValue:  barTarget,
      duration: DURATION.PROGRESS_FILL,
      easing:   Easing.out(Easing.exp),
      useNativeDriver: false,
    });

    // Step label blink
    const blinkAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: DURATION.BLINK, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: DURATION.BLINK, useNativeDriver: true }),
      ]),
    );

    spinAnim.start();
    barAnim.start();
    blinkAnim.start();

    const interval = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, DURATION.STEP_ADVANCE);

    return () => {
      spinAnim.stop();
      barAnim.stop();
      blinkAnim.stop();
      clearInterval(interval);
    };
  }, [spin, bar, blink, progress]);

  const rotate = spin.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const barWidth = bar.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  const currentStep = SCAN_STEPS[stepIdx] ?? SCAN_STEPS[0];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bg, '#0D1220', COLORS.bg]}
        style={StyleSheet.absoluteFill}
      />

      {/* Spinner */}
      <View style={styles.spinnerWrap}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialCommunityIcons name="loading" size={72} color={COLORS.accent} />
        </Animated.View>
        <View style={styles.spinnerIcon}>
          <MaterialCommunityIcons name="receipt" size={26} color={COLORS.accent} />
        </View>
      </View>

      <Text style={styles.title}>Parsing Bill</Text>

      {/* Step label */}
      <Animated.Text style={[styles.stepLabel, { opacity: blink }]} accessibilityLiveRegion="polite">
        {currentStep}
      </Animated.Text>

      {/* Progress bar */}
      <View style={styles.progressTrack} accessibilityRole="progressbar">
        <Animated.View style={[styles.progressFill, { width: barWidth }]}>
          <LinearGradient
            colors={[COLORS.accentDim, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Shimmer skeleton rows */}
      {([0.4, 0.62, 0.5, 0.72] as const).map((w, i) => (
        <View
          key={i}
          style={[styles.shimmerRow, { width: `${w * 100}%`, opacity: 0.12 + i * 0.04 }]}
        />
      ))}
    </View>
  );
});

ScanningProgress.displayName = 'ScanningProgress';

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.bg,
    gap:             20,
    paddingHorizontal: 36,
  },
  spinnerWrap: {
    width:  110,
    height: 110,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   8,
  },
  spinnerIcon: {
    position: 'absolute',
  },
  title: {
    color:       COLORS.text,
    fontSize:    24,
    fontWeight:  '700',
    letterSpacing: -0.3,
  },
  stepLabel: {
    color:       COLORS.accent,
    fontSize:    14,
    fontWeight:  '500',
    letterSpacing: 0.3,
  },
  progressTrack: {
    width:           '100%',
    height:          4,
    backgroundColor: COLORS.border,
    borderRadius:    2,
    overflow:        'hidden',
  },
  progressFill: {
    height:       '100%',
    borderRadius: 2,
    overflow:     'hidden',
  },
  shimmerRow: {
    height:          10,
    backgroundColor: COLORS.border,
    borderRadius:    5,
    alignSelf:       'flex-start',
    marginTop:       6,
  },
});