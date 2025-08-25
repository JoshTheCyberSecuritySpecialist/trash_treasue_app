import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Map, ScrollText, Plus, Trophy, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const tabs = [
  { name: 'Home', path: '/', icon: Map, emoji: '🗺' },
  { name: 'Quests', path: '/missions', icon: ScrollText, emoji: '📋' },
  { name: 'Drop', path: '/report', icon: Plus, emoji: '➕' },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, emoji: '🏆' },
  { name: 'Me', path: '/me', icon: User, emoji: '👤' },
];

export const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tabPath: string) => {
    if (tabPath === '/') return pathname === '/';
    return pathname.startsWith(tabPath);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[styles.emoji, active && styles.emojiActive]}>
                {tab.emoji}
              </Text>
            </View>
            <Text style={[
              styles.label, 
              { color: active ? Colors.primary : Colors.textSecondary },
              active && styles.labelActive
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 60,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
  },
  iconContainer: {
    marginBottom: 2,
  },
  emoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  emojiActive: {
    opacity: 1,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});