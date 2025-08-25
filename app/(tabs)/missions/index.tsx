import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { MissionCard } from '@/components/MissionCard';
import { FilterChips } from '@/components/FilterChips';
import { useAppData } from '@/hooks/useAppData';
import { Colors } from '@/constants/Colors';
import { calculateDistance } from '@/utils/locationUtils';

const statusFilters = ['All', 'Needs', 'Progress', 'Cleaned'];

export default function MissionsScreen() {
  const { missions, loading } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredMissions = missions
    .map(mission => ({
      ...mission,
      distance: calculateDistance(
        { lat: 37.7749, lng: -122.4194 }, // Default SF location
        mission.coords
      )
    }))
    .filter(mission => {
      const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mission.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedFilter === 'All' || 
                           mission.status === selectedFilter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Active Quests</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quests..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <FilterChips
        filters={statusFilters}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {filteredMissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No quests found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? `No quests match "${searchQuery}"`
              : 'No quests available right now'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </ScrollView>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});