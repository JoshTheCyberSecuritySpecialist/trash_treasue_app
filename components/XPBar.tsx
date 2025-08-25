import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getLevelFromXP, getLevelProgress, getXPForNextLevel, LEVEL_NAMES, LEVEL_COLORS } from '@/constants/GameMechanics';

interface XPBarProps {
  currentXP: number;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ 
  currentXP, 
  animated = false, 
  size = 'medium',
  showLevel = true 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentLevel = getLevelFromXP(currentXP);
  const progress = getLevelProgress(currentXP);
  const nextLevelXP = getXPForNextLevel(currentXP);
  const levelColor = LEVEL_COLORS[currentLevel - 1] || LEVEL_COLORS[0];

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  const getBarHeight = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 16;
      default: return 12;
    }
  };

  return (
    <View style={styles.container}>
      {showLevel && (
        <View style={styles.levelInfo}>
          <Text style={[styles.levelText, { fontSize: getTextSize(), color: levelColor }]}>
            Lv.{currentLevel} {LEVEL_NAMES[currentLevel - 1]}
          </Text>
          <Text style={[styles.xpText, { fontSize: getTextSize() - 2 }]}>
            {currentXP} / {nextLevelXP} XP
          </Text>
        </View>
      )}
      
      <View style={[styles.barContainer, { height: getBarHeight() }]}>
        <View style={[styles.barBackground, { borderRadius: getBarHeight() / 2 }]} />
        <Animated.View
          style={[
            styles.barFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: levelColor,
              borderRadius: getBarHeight() / 2,
              shadowColor: levelColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 4,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  xpText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  barContainer: {
    position: 'relative',
    width: '100%',
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.border,
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
});