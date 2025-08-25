import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  visible, 
  onHide 
}) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2700),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return Colors.cleaned;
      case 'error': return Colors.needs;
      case 'info': return Colors.primary;
      default: return Colors.cleaned;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(), opacity }
      ]}
      pointerEvents="none"
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});