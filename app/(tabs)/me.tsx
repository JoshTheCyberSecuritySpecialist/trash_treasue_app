import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CreditCard as Edit2, Settings, Shield, Flame } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { MissionCard } from '@/components/MissionCard';
import { XPToast } from '@/components/XPToast';
import { XPBar } from '@/components/XPBar';
import { LevelBorder } from '@/components/LevelBorder';
import { Colors } from '@/constants/Colors';
import { getLevelFromXP, LEVEL_NAMES, BADGES } from '@/constants/GameMechanics';

export default function ProfileScreen() {
  const { user, missions, updateUser, isAdmin, toggleAdmin } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [selectedTab, setSelectedTab] = useState<'reports' | 'claims'>('reports');
  const [xpToast, setXpToast] = useState({ visible: false, xp: 0, message: '' });

  const showXpToast = (xp: number, message: string) => {
    setXpToast({ visible: true, xp, message });
  };

  const hideXpToast = () => {
    setXpToast({ ...xpToast, visible: false });
  };

  const handleSaveUsername = async () => {
    if (!user) return;
    
    const trimmed = editUsername.trim();
    if (trimmed.length < 3) {
      showXpToast(0, 'Username must be at least 3 characters');
      return;
    }

    const updatedUser = { ...user, username: trimmed };
    await updateUser(updatedUser);
    setIsEditing(false);
    showXpToast(0, 'Username updated!');
  };

  const handleCancelEdit = () => {
    setEditUsername(user?.username || '');
    setIsEditing(false);
  };

  const handleAdminToggle = () => {
    Alert.alert(
      isAdmin ? 'Disable Admin Mode' : 'Enable Admin Mode',
      isAdmin ? 'This will disable admin features.' : 'This will enable admin features for demo purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isAdmin ? 'Disable' : 'Enable',
          onPress: () => {
            toggleAdmin();
            showXpToast(0, isAdmin ? 'Admin mode disabled' : 'Admin mode enabled');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const userQuests = missions.filter(m => m.reporterId === user.id);
  const userAccepted = missions.filter(m => m.claimedByUserId === user.id);
  const currentLevel = getLevelFromXP(user.xp || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profile</Text>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminToggle}
          activeOpacity={0.7}
        >
          <Shield size={20} color={isAdmin ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <LevelBorder xp={user.xp || 0} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.usernameInput}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  maxLength={20}
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={handleSaveUsername}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <View style={styles.usernameContainer}>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.levelBadge}>
                    Lv.{currentLevel} {LEVEL_NAMES[currentLevel - 1]}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.7}
                >
                  <Edit2 size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.xpSection}>
              <XPBar currentXP={user.xp || 0} animated={false} />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user.xp || 0}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentLevel}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              {(user.streak || 0) > 0 && (
                <View style={styles.stat}>
                  <View style={styles.streakStat}>
                    <Flame size={20} color={Colors.accent} />
                    <Text style={styles.statValue}>{user.streak}</Text>
                  </View>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
              )}
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user.badges.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </View>

          {user.badges.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>Badges Earned</Text>
              <View style={styles.badgesGrid}>
                {user.badges.map((badge) => {
                  const info = BADGES[badge as keyof typeof BADGES];
                  if (!info) return null;
                  
                  return (
                    <View key={badge} style={styles.badgeCard}>
                      <Text style={[styles.badgeIcon, { color: info.color }]}>
                        {info.icon}
                      </Text>
                      <Text style={styles.badgeName}>{info.name}</Text>
                      <Text style={styles.badgeDescription}>{info.description}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </LevelBorder>

        <View style={styles.activitySection}>
          <View style={styles.activityTabs}>
            <TouchableOpacity
              style={[styles.activityTab, selectedTab === 'reports' && styles.activityTabActive]}
              onPress={() => setSelectedTab('reports')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.activityTabText,
                selectedTab === 'reports' && styles.activityTabTextActive
              ]}>
                My Quests ({userQuests.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.activityTab, selectedTab === 'claims' && styles.activityTabActive]}
              onPress={() => setSelectedTab('claims')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.activityTabText,
                selectedTab === 'claims' && styles.activityTabTextActive
              ]}>
                Accepted ({userAccepted.length})
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'reports' ? (
            <View style={styles.missionsList}>
              {userQuests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No quests yet</Text>
                  <Text style={styles.emptySubtitle}>Start by dropping a quest to earn your first XP!</Text>
                </View>
              ) : (
                userQuests.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))
              )}
            </View>
          ) : (
            <View style={styles.missionsList}>
              {userAccepted.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No accepted quests yet</Text>
                  <Text style={styles.emptySubtitle}>Accept a quest to start making a difference!</Text>
                </View>
              ) : (
                userAccepted.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))
              )}
            </View>
          )}
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.adminPanel}
            onPress={() => {/* Navigate to admin panel */}}
            activeOpacity={0.7}
          >
            <Settings size={20} color={Colors.primary} />
            <Text style={styles.adminPanelText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <XPToast
        xpGained={xpToast.xp}
        message={xpToast.message}
        visible={xpToast.visible}
        onHide={hideXpToast}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  adminButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    minWidth: 200,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  usernameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  levelBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  xpSection: {
    width: '100%',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  streakStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badgesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  activitySection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  activityTab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activityTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  activityTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activityTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  missionsList: {
    paddingVertical: 16,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  adminPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  adminPanelText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});