export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]; // XP needed for each level
export const LEVEL_NAMES = ['Rookie', 'Cleaner', 'Guardian', 'Champion', 'Legend'];
export const LEVEL_COLORS = ['#9ca3af', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const XP_REWARDS = {
  REPORT: 5,
  CLAIM: 10,
  COMPLETE: 25,
  UPVOTE_BONUS: 3,
};

export const BADGES = {
  firstReport: {
    name: 'First Drop',
    description: 'Dropped your first quest',
    icon: '🎯',
    color: '#00f7ff',
  },
  firstCleanup: {
    name: 'Quest Master',
    description: 'Completed your first quest',
    icon: '⚡',
    color: '#39FF14',
  },
  fiveCleanups: {
    name: 'Eco Hunter',
    description: 'Completed 5 quests',
    icon: '🦸‍♂️',
    color: '#a855f7',
  },
  tenCleanups: {
    name: 'Trash Slayer',
    description: 'Completed 10 quests',
    icon: '🔥',
    color: '#ff073a',
  },
  fiftyCleanups: {
    name: 'Eco Legend',
    description: 'Completed 50 quests',
    icon: '👑',
    color: '#ffd700',
  },
  streakWarrior: {
    name: 'Streak Warrior',
    description: '7-day activity streak',
    icon: '🔥',
    color: '#ff6b35',
  },
};

export const getLevelFromXP = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const getXPForNextLevel = (currentXP: number): number => {
  const currentLevel = getLevelFromXP(currentXP);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

export const getLevelProgress = (currentXP: number): number => {
  const currentLevel = getLevelFromXP(currentXP);
  if (currentLevel >= LEVEL_THRESHOLDS.length) return 1;
  
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel];
  
  return (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
};

export const updateUserStreak = (user: any): any => {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.lastActiveDate;
  
  if (!lastActive) {
    return { ...user, streak: 1, lastActiveDate: today };
  }
  
  const lastActiveDate = new Date(lastActive);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastActiveDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Continue streak
    return { ...user, streak: user.streak + 1, lastActiveDate: today };
  } else if (diffDays === 0) {
    // Same day, no change
    return user;
  } else {
    // Streak broken, reset
    return { ...user, streak: 1, lastActiveDate: today };
  }
};