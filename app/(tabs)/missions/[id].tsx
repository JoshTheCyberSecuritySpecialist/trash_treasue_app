import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ThumbsUp, MapPin, Share, Flag, Camera, Zap } from 'lucide-react-native';
import { Mission } from '@/types';
import { useAppData } from '@/hooks/useAppData';
import { StatusPill } from '@/components/StatusPill';
import { SimpleMap } from '@/components/SimpleMap';
import { XPToast } from '@/components/XPToast';
import { BadgeUnlock } from '@/components/BadgeUnlock';
import { Colors } from '@/constants/Colors';
import { calculateDistance } from '@/utils/locationUtils';
import { pickAndCompressImage } from '@/utils/imageUtils';
import { XP_REWARDS, updateUserStreak, BADGES } from '@/constants/GameMechanics';

export default function MissionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { missions, user, updateMissions, updateUser } = useAppData();
  const [mission, setMission] = useState<Mission | null>(null);
  const [hasCheered, setHasCheered] = useState(false);
  const [xpToast, setXpToast] = useState({ visible: false, xp: 0, message: '' });
  const [badgeUnlock, setBadgeUnlock] = useState({ visible: false, badge: '' });

  useEffect(() => {
    const foundMission = missions.find(m => m.id === id);
    if (foundMission) {
      setMission({
        ...foundMission,
        distance: calculateDistance(
          { lat: 37.7749, lng: -122.4194 },
          foundMission.coords
        )
      });
      setHasCheered(user?.upvotedMissionIds.includes(foundMission.id) || false);
    }
  }, [id, missions, user]);

  const showXpToast = (xp: number, message: string) => {
    setXpToast({ visible: true, xp, message });
  };

  const hideXpToast = () => {
    setXpToast({ ...xpToast, visible: false });
  };

  const showBadgeUnlock = (badge: string) => {
    setBadgeUnlock({ visible: true, badge });
  };

  const hideBadgeUnlock = () => {
    setBadgeUnlock({ ...badgeUnlock, visible: false });
  };

  const handleCheer = async () => {
    if (!mission || !user || hasCheered) return;

    const updatedMissions = missions.map(m => {
      if (m.id === mission.id) {
        return { ...m, upvotes: m.upvotes + 1 };
      }
      return m;
    });

    const updatedUser = {
      ...user,
      upvotedMissionIds: [...user.upvotedMissionIds, mission.id]
    };

    await updateMissions(updatedMissions);
    await updateUser(updatedUser);
    setHasCheered(true);
    
    // Award bonus points if mission hits 5 upvotes
    if (mission.upvotes + 1 === 5) {
      showXpToast(0, 'Quest reached 5 cheers! Reporter awarded bonus XP.');
    } else {
      showXpToast(0, 'Cheered! 👍');
    }
  };

  const handleAcceptQuest = async () => {
    if (!mission || !user || mission.status !== 'needs') return;

    const updatedMissions = missions.map(m => {
      if (m.id === mission.id) {
        return {
          ...m,
          status: 'progress' as const,
          claimedByUserId: user.id,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    });

    let updatedUser = updateUserStreak(user);
    updatedUser = {
      ...updatedUser,
      points: updatedUser.points + XP_REWARDS.CLAIM,
      xp: updatedUser.xp + XP_REWARDS.CLAIM,
    };

    await updateMissions(updatedMissions);
    await updateUser(updatedUser);
    showXpToast(XP_REWARDS.CLAIM, '✨ Quest Accepted!');
  };

  const handleCompleteQuest = async () => {
    if (!mission || !user || mission.claimedByUserId !== user.id) return;

    // Pick after photos
    const afterPhoto = await pickAndCompressImage();
    if (!afterPhoto) {
      showXpToast(0, 'Please add at least one after photo');
      return;
    }

    const updatedMissions = missions.map(m => {
      if (m.id === mission.id) {
        return {
          ...m,
          status: 'cleaned' as const,
          photosAfter: [...m.photosAfter, afterPhoto.uri],
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    });

    // Award points and badges
    let newBadges = [...user.badges];
    const cleanedMissions = updatedMissions.filter(m => 
      m.status === 'cleaned' && m.claimedByUserId === user.id
    ).length;

    let newBadgeUnlocked = '';
    if (cleanedMissions === 1 && !newBadges.includes('firstCleanup')) {
      newBadges.push('firstCleanup');
      newBadgeUnlocked = 'firstCleanup';
    }
    else if (cleanedMissions === 5 && !newBadges.includes('fiveCleanups')) {
      newBadges.push('fiveCleanups');
      newBadgeUnlocked = 'fiveCleanups';
    }
    else if (cleanedMissions === 10 && !newBadges.includes('tenCleanups')) {
      newBadges.push('tenCleanups');
      newBadgeUnlocked = 'tenCleanups';
    }
    else if (cleanedMissions === 50 && !newBadges.includes('fiftyCleanups')) {
      newBadges.push('fiftyCleanups');
      newBadgeUnlocked = 'fiftyCleanups';
    }

    let updatedUser = updateUserStreak(user);
    updatedUser = {
      ...updatedUser,
      points: updatedUser.points + XP_REWARDS.COMPLETE,
      xp: updatedUser.xp + XP_REWARDS.COMPLETE,
      badges: newBadges
    };

    await updateMissions(updatedMissions);
    await updateUser(updatedUser);
    showXpToast(XP_REWARDS.COMPLETE, '🎉 Quest Complete!');
    
    if (newBadgeUnlocked) {
      setTimeout(() => showBadgeUnlock(newBadgeUnlocked), 1500);
    }
  };

  const handleShare = () => {
    showXpToast(0, 'Link copied to clipboard');
  };

  const handleFlag = () => {
    Alert.alert(
      'Flag Quest',
      'Why are you reporting this quest?',
      [
        { text: 'Inappropriate content', onPress: () => showXpToast(0, 'Quest flagged') },
        { text: 'Spam', onPress: () => showXpToast(0, 'Quest flagged') },
        { text: 'Inaccurate location', onPress: () => showXpToast(0, 'Quest flagged') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (!mission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Quest not found</Text>
      </View>
    );
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 5280).toFixed(0)} feet away` : `${distance.toFixed(1)} miles away`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleFlag}
            activeOpacity={0.7}
          >
            <Flag size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{mission.title}</Text>
          <View style={styles.statusRow}>
            <StatusPill status={mission.status} />
            <TouchableOpacity
              style={[styles.cheerButton, hasCheered && styles.cheerButtonActive]}
              onPress={handleCheer}
              disabled={hasCheered}
              activeOpacity={0.7}
            >
              <ThumbsUp size={16} color={hasCheered ? 'white' : Colors.textSecondary} />
              <Text style={[
                styles.cheerText,
                hasCheered && styles.cheerTextActive
              ]}>
                {mission.upvotes} cheers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mapSection}>
          <SimpleMap
            missions={[mission]}
            showLocationButton={false}
            height={200}
            center={mission.coords}
          />
          <View style={styles.locationInfo}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>
              {formatDistance(mission.distance)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Quest Details</Text>
          <Text style={styles.description}>{mission.description}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trash Type:</Text>
            <Text style={styles.detailValue}>{mission.trashType.replace('_', ' ')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Bags:</Text>
            <Text style={styles.detailValue}>{mission.estBags}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quest Dropped:</Text>
            <Text style={styles.detailValue}>{formatDate(mission.createdAt)}</Text>
          </View>
        </View>

        {mission.photosBefore.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Before Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mission.photosBefore.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {mission.photosAfter.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>After Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mission.photosAfter.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.safetySection}>
          <Text style={styles.safetyTitle}>⚠️ Safety First</Text>
          <Text style={styles.safetyText}>
            Always prioritize your safety. Only clean in public areas, follow local laws, 
            and use proper protective equipment.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {mission.status === 'needs' && mission.reporterId !== user?.id && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAcceptQuest}
            activeOpacity={0.7}
          >
            <Zap size={20} color="white" />
            <Text style={styles.primaryButtonText}>Accept Quest (+{XP_REWARDS.CLAIM} XP)</Text>
          </TouchableOpacity>
        )}
        
        {mission.status === 'progress' && mission.claimedByUserId === user?.id && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCompleteQuest}
            activeOpacity={0.7}
          >
            <Camera size={20} color="white" />
            <Text style={styles.primaryButtonText}>Complete Quest (+{XP_REWARDS.COMPLETE} XP)</Text>
          </TouchableOpacity>
        )}
      </View>

      <XPToast
        xpGained={xpToast.xp}
        message={xpToast.message}
        visible={xpToast.visible}
        onHide={hideXpToast}
      />
      
      <BadgeUnlock
        badgeKey={badgeUnlock.badge}
        visible={badgeUnlock.visible}
        onHide={hideBadgeUnlock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  titleSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cheerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  cheerButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cheerText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cheerTextActive: {
    color: 'white',
  },
  mapSection: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailsSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  photosSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  safetySection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});