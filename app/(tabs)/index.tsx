import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { SimpleMap } from '@/components/SimpleMap';
import { BottomSheet } from '@/components/BottomSheet';
import { FAB } from '@/components/FAB';
import { FilterChips } from '@/components/FilterChips';
import { XPToast } from '@/components/XPToast';
import { useAppData } from '@/hooks/useAppData';
import { Mission } from '@/types';
import { Colors } from '@/constants/Colors';
import { calculateDistance } from '@/utils/locationUtils';

const filters = ['All', 'Needs', 'Progress', 'Cleaned'];
const distanceFilters = ['2mi', '5mi', '10mi', '25mi'];

export default function HomeScreen() {
  const router = useRouter();
  const { missions, loading } = useAppData();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState('10mi');
  const [showFilters, setShowFilters] = useState(false);
  const [xpToast, setXpToast] = useState({ visible: false, xp: 0, message: '' });

  const showXpToast = (xp: number, message: string) => {
    setXpToast({ visible: true, xp, message });
  };

  const hideXpToast = () => {
    setXpToast({ ...xpToast, visible: false });
  };

  const handleMarkerPress = (mission: Mission) => {
    setSelectedMission(mission);
    setShowBottomSheet(true);
  };

  const handleViewMission = (mission: Mission) => {
    router.push(`/missions/${mission.id}` as any);
  };

  const handleLocationPress = () => {
    showXpToast(0, 'Location updated');
  };

  const handleReportPress = () => {
    router.push('/report');
  };

  const filteredMissions = missions
    .map(mission => ({
      ...mission,
      distance: calculateDistance(
        { lat: 37.7749, lng: -122.4194 }, // Default SF location
        mission.coords
      )
    }))
    .filter(mission => {
      if (selectedFilter !== 'All' && mission.status !== selectedFilter.toLowerCase()) {
        return false;
      }
      
      const maxDistance = parseInt(selectedDistance.replace('mi', ''));
      if (mission.distance && mission.distance > maxDistance) {
        return false;
      }
      
      return true;
    });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Trash Treasure</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <SimpleMap
          missions={filteredMissions}
          onMarkerPress={handleMarkerPress}
          onLocationPress={handleLocationPress}
          height={400}
        />
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Status</Text>
          <FilterChips
            filters={filters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
          
          <Text style={styles.filterTitle}>Range</Text>
          <FilterChips
            filters={distanceFilters}
            selectedFilter={selectedDistance}
            onFilterChange={setSelectedDistance}
          />
        </View>
      )}

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {filteredMissions.length} active quests within {selectedDistance}
        </Text>
      </View>

      <FAB onPress={handleReportPress} label="Drop Quest" />
      
      <BottomSheet
        mission={selectedMission}
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onViewMission={handleViewMission}
      />
      
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
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  stats: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});