// ─────────────────────────────────────────────────────────────────────────────
// components/SuccessOverlay.tsx
// Animated success confirmation screen shown after server confirms parsing
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DURATION } from '../constants/scanConfigs';
import type { SuccessOverlayProps } from '../types/scan';

export const SuccessOverlay: React.FC<SuccessOverlayProps> = React.memo(
  ({ onDone, billId }) => {
    const scale   = useRef(new Animated.Value(0.5)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue:  1,
          friction: 5,
          tension:  120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:  1,
          duration: DURATION.SUCCESS_SHOW,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(onDone, DURATION.SUCCESS_AUTO_DISMISS);
      return () => clearTimeout(timer);
    }, [onDone, opacity, scale]);

    return (
      <Animated.View style={[styles.container, { opacity }]}>
        <LinearGradient
          colors={[COLORS.bg, '#0D1220', COLORS.bg]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
          <View style={styles.ring} accessibilityRole="image" accessibilityLabel="Success">
            <Ionicons name="checkmark" size={52} color={COLORS.accent} />
          </View>

          <Text style={styles.title}>Bill Parsed!</Text>
          <Text style={styles.sub}>Data extracted successfully</Text>

          {billId ? (
            <Text style={styles.billId}>Ref: {billId}</Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    );
  },
);

SuccessOverlay.displayName = 'SuccessOverlay';

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.bg,
  },
  content: {
    alignItems: 'center',
    gap:        12,
  },
  ring: {
    width:           110,
    height:          110,
    borderRadius:    55,
    borderWidth:     3,
    borderColor:     COLORS.accent,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: 'rgba(0,229,200,0.08)',
    marginBottom:    12,
  },
  title: {
    color:         COLORS.text,
    fontSize:      28,
    fontWeight:    '700',
    letterSpacing: -0.4,
  },
  sub: {
    color:      COLORS.muted,
    fontSize:   15,
    fontWeight: '500',
  },
  billId: {
    color:       COLORS.muted,
    fontSize:    12,
    marginTop:   4,
    letterSpacing: 0.5,
  },
});