import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, MapPin, ArrowUp } from 'lucide-react-native';
import { Mission } from '@/types';
import { Colors } from '@/constants/Colors';
import { StatusPill } from './StatusPill';

interface BottomSheetProps {
  mission: Mission | null;
  visible: boolean;
  onClose: () => void;
  onViewMission: (mission: Mission) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  mission,
  visible,
  onClose,
  onViewMission,
}) => {
  if (!mission) return null;

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';
    return distance < 1 ? `${(distance * 5280).toFixed(0)} feet away` : `${distance.toFixed(1)} miles away`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {mission.title}
              </Text>
              <StatusPill status={mission.status} />
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.info}>
            <View style={styles.infoRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {formatDistance(mission.distance)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <ArrowUp size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {mission.upvotes} upvotes
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              onViewMission(mission);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View Mission</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  info: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});