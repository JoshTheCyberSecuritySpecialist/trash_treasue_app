import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Trophy, Medal, Award, Crown, Flame } from 'lucide-react-native';
import { useAppData } from '@/hooks/useAppData';
import { Colors } from '@/constants/Colors';
import { getLevelFromXP, LEVEL_NAMES, LEVEL_COLORS, BADGES } from '@/constants/GameMechanics';
import { LevelBorder } from '@/components/LevelBorder';

interface LeaderboardEntry {
  userId: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  rank: number;
}

export default function LeaderboardScreen() {
  const { missions, user } = useAppData();
  const [selectedTab, setSelectedTab] = useState<'week' | 'all'>('week');

  const generateLeaderboardData = (): LeaderboardEntry[] => {
    // For demo purposes, create some mock users with the current user
    const mockUsers = [
      { 
        id: 'user_1', 
        username: 'EcoWarrior', 
        xp: user?.xp || 0, 
        level: user?.level || 1,
        streak: user?.streak || 0,
        badges: user?.badges || [] 
      },
      { 
        id: 'user_2', 
        username: 'CleanupChamp', 
        xp: 850, 
        level: getLevelFromXP(850),
        streak: 12,
        badges: ['firstReport', 'firstCleanup', 'fiveCleanups'] 
      },
      { 
        id: 'user_3', 
        username: 'GreenHero', 
        xp: 625, 
        level: getLevelFromXP(625),
        streak: 5,
        badges: ['firstReport', 'firstCleanup'] 
      },
      { 
        id: 'user_4', 
        username: 'TrashTerminator', 
        xp: 1200, 
        level: getLevelFromXP(1200),
        streak: 25,
        badges: ['firstReport', 'firstCleanup', 'fiveCleanups', 'tenCleanups'] 
      },
      { 
        id: 'user_5', 
        username: 'NatureLover', 
        xp: 295, 
        level: getLevelFromXP(295),
        streak: 3,
        badges: ['firstReport'] 
      },
      { 
        id: 'user_6', 
        username: 'CityClean', 
        xp: 780, 
        level: getLevelFromXP(780),
        streak: 8,
        badges: ['firstReport', 'firstCleanup', 'fiveCleanups'] 
      },
      { 
        id: 'user_7', 
        username: 'EcoVolunteer', 
        xp: 375, 
        level: getLevelFromXP(375),
        streak: 2,
        badges: ['firstReport', 'firstCleanup'] 
      },
    ];

    // Sort by points and add ranks
    const sorted = mockUsers.sort((a, b) => b.xp - a.xp);
    return sorted.map((user, index) => ({
      userId: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      rank: index + 1,
    }));
  };

  const leaderboardData = generateLeaderboardData();
  const currentUserEntry = leaderboardData.find(entry => entry.userId === user?.id);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return Colors.gold;
      case 2: return Colors.silver;
      case 3: return Colors.bronze;
      default: return Colors.textSecondary;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={24} color={Colors.gold} />;
      case 2: return <Trophy size={20} color={Colors.silver} />;
      case 3: return <Medal size={20} color={Colors.bronze} />;
      default: return null;
    }
  };

  const renderBadges = (badges: string[]) => {
    return (
      <View style={styles.badgesContainer}>
        {badges.slice(0, 3).map((badge) => {
          const badgeInfo = BADGES[badge as keyof typeof BADGES];
          if (!badgeInfo) return null;
          
          return (
            <View key={badge} style={styles.badge}>
              <Text style={[styles.badgeIcon, { color: badgeInfo.color }]}>
                {badgeInfo.icon}
              </Text>
            </View>
          );
        })}
        {badges.length > 3 && (
          <Text style={styles.moreBadges}>+{badges.length - 3}</Text>
        )}
      </View>
    );
  };

  const renderPodium = () => {
    const topThree = leaderboardData.slice(0, 3);
    if (topThree.length < 3) return null;

    return (
      <View style={styles.podium}>
        {/* Second Place */}
        <View style={[styles.podiumPlace, styles.secondPlace]}>
          <LevelBorder xp={topThree[1].xp} style={styles.podiumAvatar}>
            <View style={styles.avatarContent}>
              <Text style={styles.avatarText}>
                {topThree[1].username.charAt(0)}
              </Text>
            </View>
          </LevelBorder>
          <Text style={styles.podiumName} numberOfLines={1}>
            {topThree[1].username}
          </Text>
          <Text style={styles.podiumXP}>{topThree[1].xp} XP</Text>
          <View style={[styles.podiumBase, { backgroundColor: Colors.silver }]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
        </View>

        {/* First Place */}
        <View style={[styles.podiumPlace, styles.firstPlace]}>
          <Crown size={24} color={Colors.gold} style={styles.crownIcon} />
          <LevelBorder xp={topThree[0].xp} style={styles.podiumAvatar}>
            <View style={styles.avatarContent}>
              <Text style={styles.avatarText}>
                {topThree[0].username.charAt(0)}
              </Text>
            </View>
          </LevelBorder>
          <Text style={styles.podiumName} numberOfLines={1}>
            {topThree[0].username}
          </Text>
          <Text style={styles.podiumXP}>{topThree[0].xp} XP</Text>
          <View style={[styles.podiumBase, { backgroundColor: Colors.gold }]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
        </View>

        {/* Third Place */}
        <View style={[styles.podiumPlace, styles.thirdPlace]}>
          <LevelBorder xp={topThree[2].xp} style={styles.podiumAvatar}>
            <View style={styles.avatarContent}>
              <Text style={styles.avatarText}>
                {topThree[2].username.charAt(0)}
              </Text>
            </View>
          </LevelBorder>
          <Text style={styles.podiumName} numberOfLines={1}>
            {topThree[2].username}
          </Text>
          <Text style={styles.podiumXP}>{topThree[2].xp} XP</Text>
          <View style={[styles.podiumBase, { backgroundColor: Colors.bronze }]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'week' && styles.tabActive]}
            onPress={() => setSelectedTab('week')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'week' && styles.tabTextActive
            ]}>
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'all' && styles.tabTextActive
            ]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderPodium()}

      {currentUserEntry && (
        <LevelBorder xp={currentUserEntry.xp} style={styles.currentUserCard}>
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserLabel}>Your Rank</Text>
            <View style={styles.currentUserStats}>
              <Text style={styles.currentUserRank}>#{currentUserEntry.rank}</Text>
              <Text style={styles.currentUserXP}>{currentUserEntry.xp} XP</Text>
              <View style={styles.streakContainer}>
                <Flame size={16} color={Colors.accent} />
                <Text style={styles.streakText}>{currentUserEntry.streak}</Text>
              </View>
            </View>
          </View>
          <View style={styles.currentUserLevel}>
            <Text style={styles.levelText}>
              Lv.{currentUserEntry.level}
            </Text>
            <Text style={styles.levelName}>
              {LEVEL_NAMES[currentUserEntry.level - 1]}
            </Text>
            {renderBadges(currentUserEntry.badges)}
          </View>
        </LevelBorder>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {leaderboardData.slice(3).map((entry) => {
          const isCurrentUser = entry.userId === user?.id;
          
          return (
            <LevelBorder
              key={entry.userId}
              xp={entry.xp}
              style={[
                styles.leaderboardItem,
                isCurrentUser && styles.currentUserItem
              ]}
            >
              <View style={styles.itemLeft}>
                <View style={styles.rankContainer}>
                  <Text style={[
                    styles.rankText,
                    { color: getRankColor(entry.rank) }
                  ]}>
                    #{entry.rank}
                  </Text>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.username,
                    isCurrentUser && styles.currentUsername
                  ]}>
                    {entry.username}
                    {isCurrentUser && ' (You)'}
                  </Text>
                  <View style={styles.userStats}>
                    <Text style={styles.xpText}>{entry.xp} XP</Text>
                    <Text style={styles.levelText}>
                      Lv.{entry.level} {LEVEL_NAMES[entry.level - 1]}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemRight}>
                {entry.streak > 0 && (
                  <View style={styles.streakContainer}>
                    <Flame size={14} color={Colors.accent} />
                    <Text style={styles.streakText}>{entry.streak}</Text>
                  </View>
                )}
                {renderBadges(entry.badges)}
              </View>
            </LevelBorder>
          );
        })}
      </ScrollView>

      <View style={styles.pointsInfo}>
        <Text style={styles.pointsInfoTitle}>How to earn XP:</Text>
        <Text style={styles.pointsInfoText}>
          Drop quest: +5 XP • Accept quest: +10 XP • Complete quest: +25 XP • Get 5+ cheers: +3 bonus
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
    marginBottom: 16,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: 'white',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  podiumPlace: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginBottom: 0,
  },
  secondPlace: {
    marginBottom: 20,
  },
  thirdPlace: {
    marginBottom: 40,
  },
  crownIcon: {
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  avatarContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumXP: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  podiumBase: {
    width: 40,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  currentUserCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  currentUserInfo: {
    marginBottom: 12,
  },
  currentUserLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  currentUserStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currentUserRank: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  currentUserXP: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  currentUserLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    backgroundColor: Colors.surface,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
  },
  currentUserItem: {
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 8,
  },
  rankContainer: {
    width: 50,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  currentUsername: {
    color: Colors.primary,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  xpText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  levelText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  levelName: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  moreBadges: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  pointsInfo: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  pointsInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  pointsInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});