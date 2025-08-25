import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { BottomNav } from '@/components/BottomNav';
import { Colors } from '@/constants/Colors';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});