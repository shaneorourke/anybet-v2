import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Flame, 
  TrendingUp, 
  Clock, 
  Coins, 
  Sparkles, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Trophy,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Bet, Category, LeaderboardUser, UserProfile, InAppNotification, Wager } from './types';
import { CURRENT_USER, INITIAL_BETS, INITIAL_LEADERBOARD, INITIAL_NOTIFICATIONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BetCard } from './components/BetCard';
import { WagerModal } from './components/WagerModal';
import { BetDetailModal } from './components/BetDetailModal';
import { CreateBetModal } from './components/CreateBetModal';
import { ResolveBetModal } from './components/ResolveBetModal';
import { ShareModal } from './components/ShareModal';
import { LeaderboardView } from './components/LeaderboardView';
import { MyBetsDashboard } from './components/MyBetsDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { ProfileModal } from './components/ProfileModal';
import { AiDiscoverModal } from './components/AiDiscoverModal';
import { calculateOdds, formatCoins, getTimeRemaining, getDailyBonusStatus } from './utils/odds';
import { sound } from './utils/audio';

export default function App() {
  // Persistence state with version migration to wipe legacy bets
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      if (localStorage.getItem('versus_app_version') !== 'v4') {
        localStorage.removeItem('versus_user');
        localStorage.removeItem('versus_bets');
        localStorage.setItem('versus_app_version', 'v4');
        return CURRENT_USER;
      }
      const saved = localStorage.getItem('versus_user');
      return saved ? JSON.parse(saved) : CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    try {
      if (localStorage.getItem('versus_app_version') !== 'v4') {
        localStorage.removeItem('versus_bets');
        return [];
      }
      const saved = localStorage.getItem('versus_bets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => {
    try {
      const saved = localStorage.getItem('versus_leaderboard');
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('versus_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // UI state
  const [currentView, setCurrentView] = useState<'arena' | 'my-wagers' | 'leaderboard' | 'history'>('arena');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'ending_soon' | 'biggest_pot'>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [liveToast, setLiveToast] = useState<InAppNotification | null>(null);

  // Modal states
  const [wagerModalBet, setWagerModalBet] = useState<Bet | null>(null);
  const [wagerModalSide, setWagerModalSide] = useState<'X' | 'Y'>('X');
  const [detailModalBet, setDetailModalBet] = useState<Bet | null>(null);
  const [shareModalBet, setShareModalBet] = useState<Bet | null>(null);
  const [shareModalSide, setShareModalSide] = useState<'X' | 'Y'>('X');
  const [shareModalAmount, setShareModalAmount] = useState<number>(100);
  const [resolveModalBet, setResolveModalBet] = useState<Bet | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAiDiscoverOpen, setIsAiDiscoverOpen] = useState<boolean>(false);
  const [isAiChecking, setIsAiChecking] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('versus_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('versus_bets', JSON.stringify(bets));
    } catch {}
  }, [bets]);

  useEffect(() => {
    try {
      localStorage.setItem('versus_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Push notification trigger
  const triggerNotification = (notif: InAppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    setLiveToast(notif);
    sound.playNotification();

    // Trigger browser native Web Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.ico',
        });
      } catch {}
    }

    setTimeout(() => {
      setLiveToast((current) => (current?.id === notif.id ? null : current));
    }, 4500);
  };

  // Place Wager Handler
  const handleConfirmWager = (betId: string, side: 'X' | 'Y', amount: number) => {
    if (amount > user.balance || amount <= 0) return;

    const targetBet = bets.find((b) => b.id === betId);
    if (!targetBet) return;

    const { oddsX, oddsY } = calculateOdds(targetBet.sideX.pool, targetBet.sideY.pool);
    const lockedOdds = side === 'X' ? oddsX : oddsY;
    const sideName = side === 'X' ? targetBet.sideX.name : targetBet.sideY.name;
    const potentialReturn = Math.round(amount * lockedOdds);

    const newWager: Wager = {
      id: `wager_${Date.now()}`,
      betId,
      betTitle: targetBet.title,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      side,
      sideName,
      amount,
      oddsAtBet: lockedOdds,
      potentialReturn,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Update Bet
    const updatedBets = bets.map((b) => {
      if (b.id !== betId) return b;
      const newPoolX = side === 'X' ? b.sideX.pool + amount : b.sideX.pool;
      const newPoolY = side === 'Y' ? b.sideY.pool + amount : b.sideY.pool;
      const newBettorsX = side === 'X' ? b.sideX.bettorsCount + 1 : b.sideX.bettorsCount;
      const newBettorsY = side === 'Y' ? b.sideY.bettorsCount + 1 : b.sideY.bettorsCount;
      const newTotal = newPoolX + newPoolY;
      const newOdds = calculateOdds(newPoolX, newPoolY);

      return {
        ...b,
        totalPot: newTotal,
        sideX: {
          ...b.sideX,
          pool: newPoolX,
          bettorsCount: newBettorsX,
          odds: newOdds.oddsX,
        },
        sideY: {
          ...b.sideY,
          pool: newPoolY,
          bettorsCount: newBettorsY,
          odds: newOdds.oddsY,
        },
        wagers: [newWager, ...b.wagers],
      };
    });

    setBets(updatedBets);

    // Update User Balance & XP
    const newXP = user.xp + Math.round(amount / 5);
    const newLevel = Math.floor(newXP / 500) + 1;
    setUser((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      totalWagered: prev.totalWagered + amount,
      xp: newXP,
      level: Math.max(prev.level, newLevel),
    }));

    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'bet_placed',
      title: 'Wager Confirmed! 🎯',
      message: `You staked ${formatCoins(amount)} $VS on ${sideName} @ ${lockedOdds}x in "${targetBet.title}".`,
      timestamp: 'Just now',
      read: false,
      betId,
    });
  };

  // Create Bet Handler
  const handleCreateBet = (data: {
    title: string;
    category: Category;
    sideXName: string;
    sideYName: string;
    rules: string;
    endDate: string;
    seedAmount: number;
    bannerImage?: string;
  }) => {
    const seed = data.seedAmount || 0;
    const splitSeed = Math.floor(seed / 2);

    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      title: data.title,
      category: data.category,
      sideX: {
        id: 'X',
        name: data.sideXName,
        avatarOrFlag: '⚡',
        pool: splitSeed,
        bettorsCount: splitSeed > 0 ? 1 : 0,
        odds: 2.0,
      },
      sideY: {
        id: 'Y',
        name: data.sideYName,
        avatarOrFlag: '🔥',
        pool: splitSeed,
        bettorsCount: splitSeed > 0 ? 1 : 0,
        odds: 2.0,
      },
      totalPot: seed,
      rules: data.rules,
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isCurrentUser: true,
      },
      createdAt: new Date().toISOString(),
      endDate: data.endDate,
      status: 'active',
      wagers: [],
      stats: {
        views: 12,
        shares: 0,
      },
    };

    setBets([newBet, ...bets]);

    // Deduct seed from balance if applicable
    if (seed > 0) {
      setUser((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - seed),
        xp: prev.xp + 100,
      }));
    }

    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'community',
      title: 'Showdown Created! 🚀',
      message: `Your duel "${newBet.title}" is now open for wagers from the community!`,
      timestamp: 'Just now',
      read: false,
      betId: newBet.id,
    });
  };

  // Settle & Resolve Bet Handler
  const handleResolveBet = (betId: string, outcome: 'X' | 'Y' | 'refunded', notes: string) => {
    const targetBet = bets.find((b) => b.id === betId);
    if (!targetBet) return;

    let userPayoutTotal = 0;
    let userWonWagers = 0;
    let userLostWagers = 0;

    const updatedWagers = targetBet.wagers.map((w) => {
      if (outcome === 'refunded') {
        if (w.userId === user.id) {
          userPayoutTotal += w.amount;
        }
        return { ...w, status: 'refunded' as const, payout: w.amount };
      }

      if (w.side === outcome) {
        const payout = Math.round(w.amount * w.oddsAtBet);
        if (w.userId === user.id) {
          userPayoutTotal += payout;
          userWonWagers++;
        }
        return { ...w, status: 'won' as const, payout };
      } else {
        if (w.userId === user.id) {
          userLostWagers++;
        }
        return { ...w, status: 'lost' as const };
      }
    });

    const updatedBets = bets.map((b) => {
      if (b.id !== betId) return b;
      return {
        ...b,
        status: outcome === 'refunded' ? ('cancelled_refunded' as const) : ('resolved' as const),
        outcome,
        resolutionNotes: notes,
        resolvedAt: new Date().toISOString(),
        wagers: updatedWagers,
      };
    });

    setBets(updatedBets);

    // Update User Record & Balance
    if (userPayoutTotal > 0 || userLostWagers > 0) {
      setUser((prev) => {
        const newBalance = prev.balance + userPayoutTotal;
        const newTotalWon = prev.totalWon + (outcome !== 'refunded' ? userPayoutTotal : 0);
        const newStreak = userWonWagers > 0 ? prev.winStreak + 1 : userLostWagers > 0 ? 0 : prev.winStreak;
        return {
          ...prev,
          balance: newBalance,
          totalWon: newTotalWon,
          betsWon: prev.betsWon + userWonWagers,
          betsLost: prev.betsLost + userLostWagers,
          winStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
        };
      });
    }

    if (outcome === 'refunded') {
      triggerNotification({
        id: `notif_${Date.now()}`,
        type: 'bet_refunded',
        title: 'Duel Refunded 100% 🔄',
        message: `"${targetBet.title}" was cancelled. All stakes returned to participants.`,
        timestamp: 'Just now',
        read: false,
        betId,
      });
    } else {
      const winnerName = outcome === 'X' ? targetBet.sideX.name : targetBet.sideY.name;
      triggerNotification({
        id: `notif_${Date.now()}`,
        type: userWonWagers > 0 ? 'bet_won' : 'creator_resolution',
        title: userWonWagers > 0 ? '🎉 Wager Won!' : 'Showdown Settled 🏆',
        message: `${winnerName} won the match! ${userPayoutTotal > 0 ? `You received +${formatCoins(userPayoutTotal)} $VS!` : ''}`,
        timestamp: 'Just now',
        read: false,
        betId,
      });
    }
  };

  // Simulate missed deadline auto-refund rule
  const handleSimulateRefund = (betId: string) => {
    handleResolveBet(
      betId,
      'refunded',
      'End date deadline exceeded with unconfirmed creator result. System executed automatic 100% wager refund to all participants.'
    );
    if (detailModalBet?.id === betId) {
      setDetailModalBet(null);
    }
  };

  // Verify match with Google Gemini Search Grounding
  const handleAiVerifyOutcome = async (targetBet: Bet) => {
    setIsAiChecking(true);
    sound.playClick();

    try {
      const res = await fetch('/api/gemini/verify-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetBet.title,
          sideX: targetBet.sideX.name,
          sideY: targetBet.sideY.name,
          eventLeague: targetBet.eventLeague,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const lastAiCheck = {
          timestamp: data.timestamp || new Date().toISOString(),
          concluded: !!data.concluded,
          winner: data.winner,
          summary: data.summary,
          source: data.sources?.[0],
        };

        const updated = bets.map((b) => (b.id === targetBet.id ? { ...b, lastAiCheck } : b));
        setBets(updated);
        if (detailModalBet?.id === targetBet.id) {
          setDetailModalBet({ ...targetBet, lastAiCheck });
        }

        if (data.concluded && data.winner) {
          sound.playWin();
          // Immediately settle the duel and distribute payouts!
          handleResolveBet(
            targetBet.id,
            data.winner,
            data.summary || 'Verified and settled by Google Gemini Live Oracle.'
          );

          triggerNotification({
            id: `notif_${Date.now()}`,
            type: 'creator_resolution',
            title: 'Gemini Verified Live Result! 🤖🏆',
            message: `${data.winnerName || (data.winner === 'X' ? targetBet.sideX.name : targetBet.sideY.name)} won! Market settled & payouts distributed.`,
            timestamp: 'Just now',
            read: false,
            betId: targetBet.id,
          });
        } else {
          triggerNotification({
            id: `notif_${Date.now()}`,
            type: 'community',
            title: 'Gemini Match Status Checked ℹ️',
            message: data.summary ? `${data.summary.slice(0, 110)}...` : 'Match in progress / broadcast scheduled.',
            timestamp: 'Just now',
            read: false,
            betId: targetBet.id,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to verify match with Gemini:', err);
    } finally {
      setIsAiChecking(false);
    }
  };

  // Sync all active real-world matches with Gemini
  const handleSyncAllRealWorldMatches = async () => {
    const realWorldActive = bets.filter((b) => b.isRealWorld && b.status === 'active');
    if (realWorldActive.length === 0) {
      triggerNotification({
        id: `notif_${Date.now()}`,
        type: 'community',
        title: 'All Matches Up to Date',
        message: 'No pending real-world duels require status updates right now.',
        timestamp: 'Just now',
        read: false,
      });
      return;
    }

    setIsAiChecking(true);
    sound.playClick();
    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'community',
      title: 'Syncing with Google Gemini Search... 🔍',
      message: `Scanning live internet fixtures for ${realWorldActive.length} active pro matches...`,
      timestamp: 'Just now',
      read: false,
    });

    let checkedCount = 0;
    for (const b of realWorldActive.slice(0, 3)) {
      await handleAiVerifyOutcome(b);
      checkedCount++;
    }
    setIsAiChecking(false);
  };

  // Add match from AI Discover Modal
  const handleAddDiscoveredMatch = (match: any) => {
    const isTraitorsOrTv = 
      match.category === 'entertainment' || 
      match.title.toLowerCase().includes('traitor') || 
      match.title.toLowerCase().includes('celebrity') ||
      match.title.toLowerCase().includes('murder') ||
      match.title.toLowerCase().includes('banish');

    // Calculate realistic endDate based on exact hoursUntil or scheduledEnd
    const hours = typeof match.hoursUntil === 'number'
      ? match.hoursUntil
      : (typeof match.daysUntil === 'number' ? match.daysUntil * 24 : 10);

    let endDate: string;
    if (match.scheduledEnd) {
      endDate = new Date(match.scheduledEnd).toISOString();
    } else if (match.isConcluded || hours === 0) {
      // Concluded match (e.g. Episode 3 Richard E. Grant banishment)
      endDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    } else {
      endDate = new Date(Date.now() + Math.max(1, hours) * 60 * 60 * 1000).toISOString();
    }

    const newBet: Bet = {
      id: `bet_ai_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: match.title,
      category: isTraitorsOrTv ? 'entertainment' : ((match.category as Category) || 'gaming'),
      bannerImage: isTraitorsOrTv
        ? '/src/assets/images/match_celebrity_traitors_1791480924755.jpg'
        : match.category === 'sports' 
        ? '/src/assets/images/match_football_clash_1791404902212.jpg'
        : match.title.toLowerCase().includes('street')
        ? '/src/assets/images/match_street_fighter_evo_1791405981217.jpg'
        : '/src/assets/images/match_cs2_major_1791405968984.jpg',
      twitchUrl: match.twitchUrl || (isTraitorsOrTv ? 'https://www.bbc.co.uk/iplayer' : match.category === 'gaming' ? 'https://www.twitch.tv/eslcs' : undefined),
      isRealWorld: true,
      eventLeague: match.eventLeague || (isTraitorsOrTv ? 'Celebrity Traitors UK 2026 (BBC One)' : 'Global Invitational'),
      sideX: {
        id: 'X',
        name: match.sideXName,
        avatarOrFlag: match.sideXFlag || (isTraitorsOrTv ? '🏰' : '⚡'),
        pool: 5000,
        bettorsCount: 20,
        odds: 2.0,
      },
      sideY: {
        id: 'Y',
        name: match.sideYName,
        avatarOrFlag: match.sideYFlag || (isTraitorsOrTv ? '🗡️' : '🔥'),
        pool: 5000,
        bettorsCount: 20,
        odds: 2.0,
      },
      totalPot: 10000,
      rules: match.rules || 'Official tournament match winner verified via stream & tournament bracket.',
      creator: {
        id: 'oracle_ai',
        name: 'Versus Gemini Oracle',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GeminiOracle&backgroundColor=0284c7',
        isCurrentUser: false,
      },
      createdAt: new Date().toISOString(),
      endDate,
      status: 'active',
      wagers: [],
      stats: {
        views: 450,
        shares: 12,
      },
    };

    setBets((prev) => [newBet, ...prev]);

    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'community',
      title: 'Real-World Match Added! ⚡',
      message: `"${newBet.title}" is now open for wagers in the Arena!`,
      timestamp: 'Just now',
      read: false,
      betId: newBet.id,
    });
  };

  // Claim Daily Coins Bonus with strict 24-hour cooldown
  const handleClaimDailyBonus = () => {
    const dailyStatus = getDailyBonusStatus(user.lastDailyBonus);

    if (!dailyStatus.canClaim) {
      sound.playClick();
      triggerNotification({
        id: `notif_${Date.now()}`,
        type: 'bonus',
        title: 'Daily Cooldown Active ⏳',
        message: `You already claimed today's coin drop! Next +250 $VS bonus available in ${dailyStatus.timeRemainingText}.`,
        timestamp: 'Just now',
        read: false,
      });
      return;
    }

    sound.playWin();
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + 250,
      xp: prev.xp + 50,
      lastDailyBonus: new Date().toISOString(),
    }));

    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'bonus',
      title: 'Daily Coin Drop Claimed! 🎁',
      message: '+250 $VS Coins added to your wallet. Come back tomorrow for the next streak bonus!',
      timestamp: 'Just now',
      read: false,
    });
  };

  // Simulate live community activity for test demo
  const handleSimulateCommunityActivity = () => {
    const activeBets = bets.filter((b) => b.status === 'active');
    if (activeBets.length === 0) return;

    const randomBet = activeBets[Math.floor(Math.random() * activeBets.length)];
    const randomSide: 'X' | 'Y' = Math.random() > 0.5 ? 'X' : 'Y';
    const randomAmount = [100, 250, 500, 1000][Math.floor(Math.random() * 4)];
    const botNames = ['Alex_D', 'Elena_R', 'CryptoOracle', 'Kai_Trader', 'Liam_Punter'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];

    const updatedBets = bets.map((b) => {
      if (b.id !== randomBet.id) return b;
      const newPoolX = randomSide === 'X' ? b.sideX.pool + randomAmount : b.sideX.pool;
      const newPoolY = randomSide === 'Y' ? b.sideY.pool + randomAmount : b.sideY.pool;
      const newOdds = calculateOdds(newPoolX, newPoolY);

      const botWager: Wager = {
        id: `wager_bot_${Date.now()}`,
        betId: b.id,
        betTitle: b.title,
        userId: `bot_${Date.now()}`,
        userName: botName,
        userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${botName}&backgroundColor=1e293b`,
        side: randomSide,
        sideName: randomSide === 'X' ? b.sideX.name : b.sideY.name,
        amount: randomAmount,
        oddsAtBet: randomSide === 'X' ? newOdds.oddsX : newOdds.oddsY,
        potentialReturn: Math.round(randomAmount * (randomSide === 'X' ? newOdds.oddsX : newOdds.oddsY)),
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      return {
        ...b,
        totalPot: newPoolX + newPoolY,
        sideX: {
          ...b.sideX,
          pool: newPoolX,
          bettorsCount: b.sideX.bettorsCount + (randomSide === 'X' ? 1 : 0),
          odds: newOdds.oddsX,
        },
        sideY: {
          ...b.sideY,
          pool: newPoolY,
          bettorsCount: b.sideY.bettorsCount + (randomSide === 'Y' ? 1 : 0),
          odds: newOdds.oddsY,
        },
        wagers: [botWager, ...b.wagers],
      };
    });

    setBets(updatedBets);

    triggerNotification({
      id: `notif_${Date.now()}`,
      type: 'community',
      title: 'Community Activity 🔥',
      message: `${botName} just staked ${formatCoins(randomAmount)} $VS on Side ${randomSide} in "${randomBet.title}"!`,
      timestamp: 'Just now',
      read: false,
      betId: randomBet.id,
    });
  };

  // Filtering & Sorting for Arena
  const activeBets = bets.filter((b) => b.status === 'active');
  const pastBets = bets.filter((b) => b.status !== 'active');

  const filteredArenaBets = activeBets.filter((bet) => {
    const matchCat = selectedCategory === 'all' || bet.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      bet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bet.sideX.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bet.sideY.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const sortedArenaBets = [...filteredArenaBets].sort((a, b) => {
    if (sortBy === 'trending') return b.wagers.length - a.wagers.length;
    if (sortBy === 'biggest_pot') return b.totalPot - a.totalPot;
    if (sortBy === 'ending_soon') return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    return 0;
  });

  // Spotlight match for hero section
  const spotlightBet = bets.find((b) => b.id === 'bet_1') || bets[0];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col pb-20 md:pb-12 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onClaimDailyBonus={handleClaimDailyBonus}
        notifications={notifications}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Floating Push Notification Toast */}
      {liveToast && (
        <div 
          onClick={() => {
            sound.playClick();
            setIsNotificationsOpen(true);
            setLiveToast(null);
          }}
          className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-4 shadow-2xl flex items-start gap-3 cursor-pointer animate-in slide-in-from-top-4 duration-300 backdrop-blur-md"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-white truncate">{liveToast.title}</h5>
              <span className="text-[10px] text-slate-500">Live</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{liveToast.message}</p>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: ARENA (Open Duels) */}
        {currentView === 'arena' && (
          <div className="space-y-8">
            {/* Hero Spotlight Duel Section */}
            {spotlightBet && spotlightBet.status === 'active' && (
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                {spotlightBet.bannerImage && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={spotlightBet.bannerImage}
                      alt={spotlightBet.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/90 to-transparent" />
                  </div>
                )}

                <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Featured Championship Duel</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300 lowercase font-normal">
                      closes in {getTimeRemaining(spotlightBet.endDate).text}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {spotlightBet.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                    {spotlightBet.rules}
                  </p>

                  {/* Dynamic Head-to-Head Hero Split */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setWagerModalBet(spotlightBet);
                        setWagerModalSide('X');
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                    >
                      <span className="truncate">Back {spotlightBet.sideX.name}</span>
                      <span className="font-mono font-extrabold ml-2">{spotlightBet.sideX.odds}x</span>
                    </button>

                    <div className="text-xs font-black text-slate-500 text-center uppercase tracking-widest sm:px-1">
                      VS
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setWagerModalBet(spotlightBet);
                        setWagerModalSide('Y');
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-rose-500/20 active:scale-98 transition-all"
                    >
                      <span className="truncate">Back {spotlightBet.sideY.name}</span>
                      <span className="font-mono font-extrabold ml-2">{spotlightBet.sideY.odds}x</span>
                    </button>
                  </div>

                  {/* Subtitle Metas */}
                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <strong>{formatCoins(spotlightBet.totalPot)} $VS</strong> Total Pot
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setDetailModalBet(spotlightBet);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-sans font-semibold underline underline-offset-4"
                    >
                      Inspect Match Stats
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter, Search & Segmented Controls Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search showdowns (e.g. England, Jim, Tesla)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Sort Filter Controls */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {/* AI Oracle Buttons */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAiDiscoverOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    title="Find Real-World Matches with Google Gemini"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Real-World Duels (Gemini)</span>
                  </button>

                  <button
                    onClick={handleSyncAllRealWorldMatches}
                    disabled={isAiChecking}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-50"
                    title="Check Internet Scores and Settle Results via Gemini Search"
                  >
                    <Clock className={`w-3.5 h-3.5 text-sky-400 ${isAiChecking ? 'animate-spin' : ''}`} />
                    <span>{isAiChecking ? 'Syncing...' : 'Sync Live Results'}</span>
                  </button>

                  {[
                    { id: 'trending', label: 'Trending', icon: Flame },
                    { id: 'ending_soon', label: 'Ending Soon', icon: Clock },
                    { id: 'biggest_pot', label: 'Biggest Pot', icon: Coins },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          sound.playClick();
                          setSortBy(s.id as any);
                        }}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          sortBy === s.id
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter Pills / Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Duels' },
                  { id: 'entertainment', label: '🏰 Traitors 2026 & TV' },
                  { id: 'sports', label: '⚽ Sports' },
                  { id: 'gaming', label: '🎮 Gaming & Esports' },
                  { id: 'tech', label: '💻 Tech & AI' },
                  { id: 'culinary', label: '🍳 Cooking & Food' },
                  { id: 'culture', label: '🌍 Culture' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(c.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === c.id
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Head-to-Head Bet Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Open Head-to-Head Showdowns ({sortedArenaBets.length})
                </span>
                <span className="text-xs text-slate-500">
                  Strictly X vs Y Outcomes
                </span>
              </div>

              {sortedArenaBets.length === 0 ? (
                <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">The Arena is Ready for Real-World Duels</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Celebrity Traitors UK 2026 is airing right now on BBC One & iPlayer! Scan Gemini to discover who will be murdered in the turret or banished at Claudia's Round Table tonight, or explore Champions League & esports showdowns.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsAiDiscoverOpen(true);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>🏰 Scan Celebrity Traitors 2026 Bets</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsCreateOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                    >
                      + Create Custom Duel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedArenaBets.map((bet) => (
                    <BetCard
                      key={bet.id}
                      bet={bet}
                      onQuickWager={(b, side) => {
                        setWagerModalBet(b);
                        setWagerModalSide(side);
                      }}
                      onViewDetails={(b) => setDetailModalBet(b)}
                      onShare={(b) => {
                        setShareModalBet(b);
                        setShareModalSide('X');
                        setShareModalAmount(100);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MY WAGERS & CREATED SHOWDOWNS */}
        {currentView === 'my-wagers' && (
          <MyBetsDashboard
            user={user}
            bets={bets}
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenResolve={(b) => setResolveModalBet(b)}
            onOpenShare={(b, side, amt) => {
              setShareModalBet(b);
              setShareModalSide(side);
              setShareModalAmount(amt);
            }}
            onViewDetails={(b) => setDetailModalBet(b)}
          />
        )}

        {/* VIEW 3: LEADERBOARD */}
        {currentView === 'leaderboard' && (
          <LeaderboardView
            leaderboard={leaderboard}
            user={user}
          />
        )}

        {/* VIEW 4: PAST SHOWDOWNS & RESOLVED HISTORY */}
        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                <History className="w-4 h-4" />
                <span>Showdown Archive</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Resolved & Settled Duels
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Transparent verification ledger of all past matches, confirmed winners, and payout audits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastBets.map((bet) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  onQuickWager={() => {}}
                  onViewDetails={(b) => setDetailModalBet(b)}
                  onShare={(b) => {
                    setShareModalBet(b);
                    setShareModalSide('X');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Bet Slip Modal */}
      {wagerModalBet && (
        <WagerModal
          bet={wagerModalBet}
          initialSide={wagerModalSide}
          user={user}
          isOpen={!!wagerModalBet}
          onClose={() => setWagerModalBet(null)}
          onConfirmWager={handleConfirmWager}
          onOpenShare={(b, side, amt) => {
            setShareModalBet(b);
            setShareModalSide(side);
            setShareModalAmount(amt);
          }}
        />
      )}

      {/* 2. Bet Detail & Stats Modal */}
      {detailModalBet && (
        <BetDetailModal
          bet={detailModalBet}
          user={user}
          isOpen={!!detailModalBet}
          onClose={() => setDetailModalBet(null)}
          onOpenWager={(b, side) => {
            setDetailModalBet(null);
            setWagerModalBet(b);
            setWagerModalSide(side);
          }}
          onOpenShare={(b) => {
            setShareModalBet(b);
            setShareModalSide('X');
          }}
          onOpenResolve={(b) => {
            setDetailModalBet(null);
            setResolveModalBet(b);
          }}
          onSimulateRefund={handleSimulateRefund}
          onAiVerifyOutcome={handleAiVerifyOutcome}
          isAiChecking={isAiChecking}
        />
      )}

      {/* 2.5 AI Real-World Duels Generator Modal */}
      <AiDiscoverModal
        isOpen={isAiDiscoverOpen}
        onClose={() => setIsAiDiscoverOpen(false)}
        onAddMatch={handleAddDiscoveredMatch}
      />

      {/* 3. Create Bet Modal */}
      <CreateBetModal
        user={user}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateBet={handleCreateBet}
      />

      {/* 4. Resolve Outcome Modal */}
      {resolveModalBet && (
        <ResolveBetModal
          bet={resolveModalBet}
          isOpen={!!resolveModalBet}
          onClose={() => setResolveModalBet(null)}
          onResolve={handleResolveBet}
        />
      )}

      {/* 5. Social Share Slip Modal */}
      {shareModalBet && (
        <ShareModal
          bet={shareModalBet}
          userSide={shareModalSide}
          wagerAmount={shareModalAmount}
          isOpen={!!shareModalBet}
          onClose={() => setShareModalBet(null)}
        />
      )}

      {/* 6. Push Notifications Center */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
        onSimulateCommunityActivity={handleSimulateCommunityActivity}
      />

      {/* 7. Profile & Gamification Modal */}
      <ProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        onClaimDailyBonus={handleClaimDailyBonus}
      />
    </div>
  );
}
