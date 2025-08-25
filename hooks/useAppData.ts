import { useState, useEffect } from 'react';
import { User, Mission } from '@/types';
import { storage } from '@/utils/storage';
import { createDefaultUser, createSeedMissions } from '@/utils/seedData';
import { getLevelFromXP } from '@/constants/GameMechanics';

export const useAppData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const initializeData = async () => {
    try {
      // Get or create user
      let userData = await storage.getUser();
      if (!userData) {
        userData = createDefaultUser();
        await storage.setUser(userData);
      } else {
        // Migrate existing user data to include new fields
        if (userData.xp === undefined) {
          userData.xp = userData.points || 0;
        }
        if (userData.level === undefined) {
          userData.level = getLevelFromXP(userData.xp);
        }
        if (userData.streak === undefined) {
          userData.streak = 0;
        }
      }
      setUser(userData);

      // Get or create missions
      let missionsData = await storage.getMissions();
      if (!missionsData || missionsData.length === 0) {
        missionsData = createSeedMissions();
        await storage.setMissions(missionsData);
      }
      setMissions(missionsData);

      // Get admin status
      const adminStatus = await storage.getIsAdmin();
      setIsAdmin(adminStatus);

    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    // Update level based on XP
    updatedUser.level = getLevelFromXP(updatedUser.xp);
    setUser(updatedUser);
    await storage.setUser(updatedUser);
  };

  const updateMissions = async (updatedMissions: Mission[]) => {
    setMissions(updatedMissions);
    await storage.setMissions(updatedMissions);
  };

  const toggleAdmin = async () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);
    await storage.setIsAdmin(newAdminStatus);
  };

  useEffect(() => {
    initializeData();
  }, []);

  return {
    user,
    missions,
    loading,
    isAdmin,
    updateUser,
    updateMissions,
    toggleAdmin,
  };
};