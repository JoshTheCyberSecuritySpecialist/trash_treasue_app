import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BADGES } from '@/constants/GameMechanics';

interface BadgeUnlockProps {
  badgeKey: string;
  visible: boolean;
  onHide: () => void;
}

export const BadgeUnlock: React.FC<BadgeUnlockProps> = ({ 
  badgeKey, 
  visible, 
  onHide 
}) => {
  const [scale] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  
  const badge = BADGES[badgeKey as keyof typeof BADGES];

  useEffect(() => {
    if (visible && badge) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 3000);
    }
  }, [visible, badge]);

  if (!visible || !badge) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.content, { borderColor: badge.color, shadowColor: badge.color }]}>
        <Text style={styles.icon}>{badge.icon}</Text>
        <Text style={styles.title}>Badge Unlocked!</Text>
        <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
        <Text style={styles.description}>{badge.description}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
    maxWidth: 280,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});