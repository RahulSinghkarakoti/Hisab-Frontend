import { UseAnimatedScannerReturn } from './../types/scan';
import { DURATION } from './../constants/scanConfigs'; 
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native'; 

export function useAnimatedScanner(): UseAnimatedScannerReturn {
  const shutterScale = useRef(new Animated.Value(1)).current;

  const triggerShutter = useCallback(() => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue:  0.88,
        duration: DURATION.SHUTTER_PRESS,
        useNativeDriver: true,
      }),
      Animated.spring(shutterScale, {
        toValue:  1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shutterScale]);

  return { shutterScale, triggerShutter };
}