import React from 'react';
import { View, ViewStyle } from 'react-native';
import { getLevelFromXP, LEVEL_COLORS } from '@/constants/GameMechanics';

interface LevelBorderProps {
  xp: number;
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
}

export const LevelBorder: React.FC<LevelBorderProps> = ({ 
  xp, 
  children, 
  style, 
  borderWidth = 2 
}) => {
  const level = getLevelFromXP(xp);
  const levelColor = LEVEL_COLORS[level - 1] || LEVEL_COLORS[0];

  const glowStyle: ViewStyle = {
    borderWidth,
    borderColor: levelColor,
    shadowColor: levelColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <View style={[glowStyle, style]}>
      {children}
    </View>
  );
};