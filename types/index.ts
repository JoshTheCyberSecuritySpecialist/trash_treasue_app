export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  points: number; // Keep for backward compatibility
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
  upvotedMissionIds: string[];
  dailyReportCount: { [isoDate: string]: number };
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'needs' | 'progress' | 'cleaned';
  coords: {
    lat: number;
    lng: number;
  };
  trashType: 'bags' | 'construction' | 'illegal_dump' | 'misc';
  estBags: number;
  reporterId: string;
  claimedByUserId?: string;
  upvotes: number;
  photosBefore: string[];
  photosAfter: string[];
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface ReportFlag {
  id: string;
  missionId: string;
  userId: string;
  reason: string;
  createdAt: string;
}

export type TabName = 'Home' | 'Quests' | 'Drop' | 'Leaderboard' | 'Me';