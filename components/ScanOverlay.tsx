// ─────────────────────────────────────────────────────────────────────────────
// components/ScanOverlay.tsx
// Animated viewfinder: corner brackets + laser sweep + guide text
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { COLORS, SCAN_BOX, SCREEN, DURATION } from '../constants/scanConfigs';
import type { ScanOverlayProps } from '../types/scan';

type CornerPosition = 'tl' | 'tr' | 'bl' | 'br';

function cornerStyle(pos: CornerPosition): Record<string, unknown> {
  const base = {
    position: 'absolute' as const,
    width:  SCAN_BOX.CORNER,
    height: SCAN_BOX.CORNER,
    borderColor: COLORS.accent,
    borderWidth: 3,
  };
  switch (pos) {
    case 'tl': return { ...base, top: 0, left:  0, borderRightWidth:  0, borderBottomWidth: 0, borderTopLeftRadius:     6 };
    case 'tr': return { ...base, top: 0, right: 0, borderLeftWidth:   0, borderBottomWidth: 0, borderTopRightRadius:    6 };
    case 'bl': return { ...base, bottom: 0, left:  0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius:  6 };
    case 'br': return { ...base, bottom: 0, right: 0, borderLeftWidth:  0, borderTopWidth: 0, borderBottomRightRadius: 6 };
  }
}

const CORNERS: CornerPosition[] = ['tl', 'tr', 'bl', 'br'];

export const ScanOverlay: React.FC<ScanOverlayProps> = React.memo(({ active }) => {
  const laser = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      laser.stopAnimation();
      pulse.stopAnimation();
      return;
    }

    const laserAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, {
          toValue:  1,
          duration: DURATION.LASER_SWEEP,
          easing:   Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laser, {
          toValue:  0,
          duration: DURATION.LASER_SWEEP,
          easing:   Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );

    laserAnim.start();
    pulseAnim.start();

    return () => {
      laserAnim.stop();
      pulseAnim.stop();
    };
  }, [active, laser, pulse]);

  const BOX_H  = SCAN_BOX.HEIGHT;

  const laserTranslateY = laser.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, BOX_H - 2],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Dim vignette */}
      <View style={styles.vignette} />

      {/* Scan frame */}
      <View style={styles.scanBox}>
        {CORNERS.map((pos) => (
          <View key={pos} style={cornerStyle(pos) as object} />
        ))}

        {active && (
          <Animated.View
            style={[styles.laser, { transform: [{ translateY: laserTranslateY }] }]}
          />
        )}
      </View>

      {/* Guide text */}
      <View style={styles.guideWrap}>
        <Text style={styles.guideText}>Align bill within the frame</Text>
      </View>
    </View>
  );
});

ScanOverlay.displayName = 'ScanOverlay';

const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanBox: {
    position:  'absolute',
    top:       '18%',
    alignSelf: 'center',
    width:     SCAN_BOX.WIDTH,
    height:    SCAN_BOX.HEIGHT,
    borderRadius: 4,
    overflow:  'hidden',
  },
  laser: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          2,
    backgroundColor: COLORS.accent,
    shadowColor:     COLORS.accent,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.9,
    shadowRadius:    8,
    opacity:         0.85,
  },
  guideWrap: {
    position:   'absolute',
    bottom:     SCREEN.H * 0.28,
    width:      '100%',
    alignItems: 'center',
  },
  guideText: {
    color:       COLORS.accent,
    fontSize:    13,
    fontWeight:  '500',
    letterSpacing: 0.5,
    opacity:     0.9,
  },
});