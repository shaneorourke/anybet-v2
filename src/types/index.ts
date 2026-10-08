export type Category = 'sports' | 'culinary' | 'tech' | 'entertainment' | 'gaming' | 'culture';

export interface BetSide {
  id: 'X' | 'Y';
  name: string;
  avatarOrFlag?: string;
  pool: number;
  bettorsCount: number;
  odds: number;
}

export interface Wager {
  id: string;
  betId: string;
  betTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  side: 'X' | 'Y';
  sideName: string;
  amount: number;
  oddsAtBet: number;
  potentialReturn: number;
  timestamp: string;
  status: 'pending' | 'won' | 'lost' | 'refunded';
  payout?: number;
}

export interface Bet {
  id: string;
  title: string;
  category: Category;
  sideX: BetSide;
  sideY: BetSide;
  totalPot: number;
  rules: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    isCurrentUser?: boolean;
  };
  createdAt: string;
  endDate: string;
  status: 'active' | 'resolving' | 'resolved' | 'cancelled_refunded';
  outcome?: 'X' | 'Y' | 'refunded';
  resolutionNotes?: string;
  resolvedAt?: string;
  bannerImage?: string;
  twitchUrl?: string;
  isRealWorld?: boolean;
  eventLeague?: string;
  lastAiCheck?: {
    timestamp: string;
    concluded: boolean;
    winner?: 'X' | 'Y' | 'refunded';
    summary: string;
    source?: string;
  };
  wagers: Wager[];
  stats: {
    views: number;
    shares: number;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  balance: number;
  totalWagered: number;
  totalWon: number;
  betsWon: number;
  betsLost: number;
  winStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
  badges: Badge[];
  lastDailyBonus: string | null;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  balance: number;
  profit: number;
  winRate: number;
  betsWon: number;
  betsTotal: number;
  streak: number;
  rank: number;
  badge: string;
}

export interface InAppNotification {
  id: string;
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_refunded' | 'creator_resolution' | 'bonus' | 'community';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  betId?: string;
}
