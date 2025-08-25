import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getStatusColor } from '@/constants/Colors';

interface StatusPillProps {
  status: 'needs' | 'progress' | 'cleaned';
  size?: 'small' | 'medium';
  glowing?: boolean;
}

const statusLabels = {
  needs: 'Open Quest',
  progress: 'In Progress',
  cleaned: 'Complete',
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'medium', glowing = true }) => {
  const backgroundColor = getStatusColor(status);
  
  const glowStyle: ViewStyle = glowing ? {
    shadowColor: backgroundColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  } : {};
  
  return (
    <View style={[
      styles.pill,
      { backgroundColor },
      size === 'small' && styles.smallPill,
      glowStyle,
    ]}>
      <Text style={[
        styles.text,
        size === 'small' && styles.smallText
      ]}>
        {statusLabels[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
});