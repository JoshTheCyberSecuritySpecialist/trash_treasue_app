import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, getStatusColor } from '@/constants/Colors';

interface FilterChipsProps {
  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
}) => {
  const getFilterColor = (filter: string) => {
    switch (filter.toLowerCase()) {
      case 'needs': return Colors.needs;
      case 'progress': return Colors.progress;
      case 'cleaned': return Colors.cleaned;
      default: return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;
          const backgroundColor = isSelected ? getFilterColor(filter) : 'transparent';
          const textColor = isSelected ? 'white' : Colors.textSecondary;
          const borderColor = isSelected ? getFilterColor(filter) : Colors.border;
          
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.chip,
                { backgroundColor, borderColor }
              ]}
              onPress={() => onFilterChange(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: textColor }]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});