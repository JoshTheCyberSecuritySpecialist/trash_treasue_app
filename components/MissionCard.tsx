import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ThumbsUp, Zap } from 'lucide-react-native';
import { Mission } from '@/types';
import { Colors } from '@/constants/Colors';
import { StatusPill } from './StatusPill';
import { XP_REWARDS } from '@/constants/GameMechanics';

interface MissionCardProps {
  mission: Mission;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission }) => {
  const router = useRouter();

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 5280).toFixed(0)}ft` : `${distance.toFixed(1)}mi`;
  };

  const getXPReward = () => {
    switch (mission.status) {
      case 'needs': return XP_REWARDS.CLAIM;
      case 'progress': return XP_REWARDS.COMPLETE;
      default: return 0;
    }
  };
  return (
    <TouchableOpacity
      style={[styles.container, mission.status === 'needs' && styles.glowContainer]}
      onPress={() => router.push(`/missions/${mission.id}` as any)}
      activeOpacity={0.7}
    >
      {mission.photosBefore.length > 0 && (
        <Image
          source={{ uri: mission.photosBefore[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {mission.title}
          </Text>
          <View style={styles.headerRight}>
            <StatusPill status={mission.status} size="small" />
            {getXPReward() > 0 && (
              <View style={styles.xpBadge}>
                <Zap size={12} color={Colors.accent} />
                <Text style={styles.xpText}>+{getXPReward()}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {mission.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.location}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.distance}>
              {formatDistance(mission.distance)}
            </Text>
          </View>
          
          <View style={styles.cheers}>
            <ThumbsUp size={14} color={Colors.textSecondary} />
            <Text style={styles.cheersCount}>{mission.upvotes} cheers</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  glowContainer: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  cheers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cheersCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});