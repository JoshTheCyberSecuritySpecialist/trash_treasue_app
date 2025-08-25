import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface FABProps {
  onPress: () => void;
  label?: string;
}

export const FAB: React.FC<FABProps> = ({ onPress, label = 'Drop Quest' }) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Plus size={24} color="white" strokeWidth={2.5} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 56,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});