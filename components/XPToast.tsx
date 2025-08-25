import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';

interface XPToastProps {
  xpGained: number;
  message: string;
  visible: boolean;
  onHide: () => void;
}

export const XPToast: React.FC<XPToastProps> = ({ 
  xpGained, 
  message, 
  visible, 
  onHide 
}) => {
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 2500);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <Text style={styles.xpText}>+{xpGained} XP</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
    textShadowColor: 'rgba(57, 255, 20, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
});