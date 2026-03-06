// ─────────────────────────────────────────────────────────────────────────────
// components/ErrorScreen.tsx
// Shown when upload or parsing fails — with retry / cancel actions
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/scanConfigs';
import type { ErrorScreenProps } from '../types/scan';

const ERROR_ICON: Record<string, string> = {
  NETWORK_ERROR:  'wifi-outline',
  TIMEOUT:        'time-outline',
  SERVER_ERROR:   'server-outline',
  INVALID_IMAGE:  'image-outline',
  PARSE_FAILED:   'document-text-outline',
  UNAUTHORIZED:   'lock-closed-outline',
  UNKNOWN:        'alert-circle-outline',
};

export const ErrorScreen: React.FC<ErrorScreenProps> = React.memo(
  ({ error, onRetry, onCancel }) => {
    const iconName = (ERROR_ICON[error.code] ?? 'alert-circle-outline') as never;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.bg, '#0D1220', COLORS.bg]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={52} color={COLORS.danger} />
        </View>

        <Text style={styles.title}>Something Went Wrong</Text>
        <Text style={styles.message}>{error.message}</Text>

        {error.retryable && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.accentDim, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryGrad}
            >
              <Ionicons name="refresh-outline" size={18} color={COLORS.bg} />
              <Text style={styles.retryText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

ErrorScreen.displayName = 'ErrorScreen';

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 36,
    gap:             16,
  },
  iconWrap: {
    width:           100,
    height:          100,
    borderRadius:    50,
    borderWidth:     2,
    borderColor:     COLORS.danger,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: 'rgba(255,77,106,0.08)',
    marginBottom:    8,
  },
  title: {
    color:         COLORS.text,
    fontSize:      22,
    fontWeight:    '700',
    letterSpacing: -0.3,
    textAlign:     'center',
  },
  message: {
    color:      COLORS.muted,
    fontSize:   14,
    lineHeight: 20,
    textAlign:  'center',
  },
  retryBtn: {
    width:        '100%',
    borderRadius: 14,
    overflow:     'hidden',
    marginTop:    8,
  },
  retryGrad: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap:             8,
  },
  retryText: {
    color:      COLORS.bg,
    fontSize:   16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color:      COLORS.muted,
    fontSize:   14,
    fontWeight: '500',
  },
});