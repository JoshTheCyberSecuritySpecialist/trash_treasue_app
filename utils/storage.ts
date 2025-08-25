import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mission } from '@/types';

const STORAGE_KEYS = {
  USER: 'user',
  MISSIONS: 'missions',
  OFFLINE_QUEUE: 'offline_queue',
  IS_ADMIN: 'is_admin',
};

export const storage = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async getMissions(): Promise<Mission[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting missions:', error);
      return [];
    }
  },

  async setMissions(missions: Mission[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    } catch (error) {
      console.error('Error setting missions:', error);
    }
  },

  async getOfflineQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  },

  async setOfflineQueue(queue: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error setting offline queue:', error);
    }
  },

  async getIsAdmin(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      return data === 'true';
    } catch (error) {
      console.error('Error getting admin status:', error);
      return false;
    }
  },

  async setIsAdmin(isAdmin: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin.toString());
    } catch (error) {
      console.error('Error setting admin status:', error);
    }
  },
};