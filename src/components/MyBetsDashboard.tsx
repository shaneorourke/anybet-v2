import React, { useState } from 'react';
import { 
  Flame, 
  History, 
  PlusCircle, 
  Coins, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Share2, 
  Gavel, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Tv, 
  ExternalLink,
  Users,
  Eye
} from 'lucide-react';
import { Bet, UserProfile, Wager } from '../types';
import { formatCoins, getTimeRemaining, getEventTiming, getBroadcastPlatformInfo } from '../utils/odds';
import { sound } from '../utils/audio';

interface MyBetsDashboardProps {
  user: UserProfile;
  bets: Bet[];
  onOpenCreate: () => void;
  onOpenResolve: (bet: Bet) => void;
  onOpenShare: (bet: Bet, side: 'X' | 'Y', amount: number) => void;
  onViewDetails: (bet: Bet) => void;
  onQuickWager?: (bet: Bet, side: 'X' | 'Y') => void;
  onAiVerifyOutcome?: (bet: Bet) => Promise<void>;
  onSettleAllExpired?: () => Promise<void>;
  isAiChecking?: boolean;
}

export const MyBetsDashboard: React.FC<MyBetsDashboardProps> = ({
  user,
  bets,
  onOpenCreate,
  onOpenResolve,
  onOpenShare,
  onViewDetails,
  onQuickWager,
  onAiVerifyOutcome,
  onSettleAllExpired,
  isAiChecking = false,
}) => {
  const [subTab, setSubTab] = useState<'active' | 'history' | 'created'>('active');
  const [activeScope, setActiveScope] = useState<'mine' | 'community'>('mine');
  const [createdScope, setCreatedScope] = useState<'all' | 'mine'>('all');

  // Extract current user wagers and all community wagers
  const currentUserId = user.id;
  const allUserWagers: { wager: Wager; bet: Bet }[] = [];
  const allCommunityWagers: { wager: Wager; bet: Bet }[] = [];

  bets.forEach((b) => {
    (b.wagers || []).forEach((w) => {
      const isMine = w.userId === currentUserId;
      if (isMine) {
        allUserWagers.push({ wager: w, bet: b });
      } else {
        allCommunityWagers.push({ wager: w, bet: b });
      }
    });
  });

  const activeWagers = allUserWagers.filter((item) => item.bet.status === 'active');
  const pastWagers = allUserWagers.filter((item) => item.bet.status !== 'active');
  
  // Showdowns created by current user
  const myCreatedBets = bets.filter((b) => b.creator.id === currentUserId);

  // Showdowns created by ANY community user (or current user)
  const allCommunityCreatedBets = bets.filter((b) => b.creator.id !== 'oracle_ai');
  const awaitingSettlementCount = activeWagers.filter((item) => getTimeRemaining(item.bet.endDate).isExpired).length;

  // Stats calculation
  const totalStakedActive = activeWagers.reduce((acc, curr) => acc + curr.wager.amount, 0);
  const totalProjectedReturn = activeWagers.reduce((acc, curr) => acc + curr.wager.potentialReturn, 0);
  const netHistoricalProfit = pastWagers.reduce((acc, curr) => {
    if (curr.wager.status === 'won') {
      return acc + ((curr.wager.payout || curr.wager.potentialReturn) - curr.wager.amount);
    }
    if (curr.wager.status === 'lost') {
      return acc - curr.wager.amount;
    }
    return acc; // refunded is 0 net
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metric Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Predictor Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              My Wagers & Duels Portfolio
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Manage all active stakes, analyze historical settlement payouts, and resolve showdowns you created for the community.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCreate();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Showdown</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Active At Stake</span>
            <div className="mt-1 flex items-baseline justify-between font-mono">
              <span className="text-lg font-bold text-white">{formatCoins(totalStakedActive)} $VS</span>
              <span className="text-xs text-slate-400">{activeWagers.length} slips</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Projected Max Payout</span>
            <div className="mt-1 flex items-baseline justify-between font-mono">
              <span className="text-lg font-bold text-emerald-400">+{formatCoins(totalProjectedReturn)} $VS</span>
              <span className="text-xs text-emerald-400 font-sans">In Play</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">Settled Net PnL</span>
            <div className="mt-1 flex items-baseline justify-between font-mono">
              <span className={`text-lg font-bold ${netHistoricalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netHistoricalProfit >= 0 ? `+${formatCoins(netHistoricalProfit)}` : formatCoins(netHistoricalProfit)} $VS
              </span>
              <span className="text-xs text-slate-400">{pastWagers.length} settled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 max-w-md">
        <button
          onClick={() => {
            sound.playClick();
            setSubTab('active');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'active'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Active ({activeWagers.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('history');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'history'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-cyan-400" />
          <span>Past ({pastWagers.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('created');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'created'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5 text-purple-400" />
          <span>Created ({allCommunityCreatedBets.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Wagers & Community Predictions */}
      {subTab === 'active' && (
        <div className="space-y-4">
          {/* Sub-scope Selector: My Predictions vs Community Activity */}
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <button
              onClick={() => {
                sound.playClick();
                setActiveScope('mine');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeScope === 'mine'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
              }`}
            >
              <span>My Predictions ({activeWagers.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveScope('community');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeScope === 'community'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Community Predictions ({allCommunityWagers.length})</span>
            </button>
          </div>

          {/* Scope A: User's Own Active Predictions */}
          {activeScope === 'mine' && (
            <div className="space-y-3">
              {awaitingSettlementCount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300 block">
                        {awaitingSettlementCount} Prediction{awaitingSettlementCount > 1 ? 's' : ''} Awaiting Outcome Settlement
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        Events have passed their resolution deadline. Use "Check Live Result" or "Settle Duel" below to claim your winnings immediately.
                      </span>
                    </div>
                  </div>
                  {onSettleAllExpired && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSettleAllExpired();
                      }}
                      disabled={isAiChecking}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiChecking ? 'animate-spin' : ''}`} />
                      <span>{isAiChecking ? 'Settling...' : '⚡ Settle All Expired (Auto-Payout)'}</span>
                    </button>
                  )}
                </div>
              )}

              {activeWagers.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <Coins className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No active predictions placed yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Explore open showdowns in the arena and stake your fake coins to back your winner!
                  </p>
                </div>
              ) : (
            activeWagers.map(({ wager, bet }) => {
              const timing = getEventTiming(bet.startDate, bet.endDate);
              const streamInfo = getBroadcastPlatformInfo(
                bet.streamUrl || bet.twitchUrl,
                bet.streamPlatform,
                bet.eventLeague || bet.title
              );
              const isPast = timing.isExpired;
              const hasAiVerified = !!(bet.lastAiCheck?.concluded && bet.lastAiCheck?.winner);

              return (
                <div
                  key={wager.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isPast ? 'border-amber-500/40 bg-slate-900/95 shadow-md shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="capitalize text-emerald-400 font-semibold">{bet.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      
                      {timing.isLive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          LIVE NOW (Started {timing.startCountdown})
                        </span>
                      ) : isPast ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline Passed · Ready for Payout
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded text-[10px] border border-slate-700/60">
                          <Clock className="w-3 h-3 text-sky-400" />
                          <span>Kickoff: <strong className="text-slate-200">{timing.startFormatted}</strong> ({timing.startCountdown})</span>
                        </span>
                      )}

                      {streamInfo && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shadow-sm ${streamInfo.badgeBg} ${streamInfo.badgeText}`}>
                          {streamInfo.shortName}
                        </span>
                      )}

                      {hasAiVerified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Gemini Verified
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => onViewDetails(bet)}
                      className="font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {bet.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Your Pick:</span>
                      <strong className={`px-2 py-0.5 rounded text-xs font-bold ${
                        wager.side === 'X' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        Side {wager.side}: {wager.sideName}
                      </strong>
                      <span className="text-slate-400 font-mono">@{wager.oddsAtBet}x</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[11px] text-slate-400 block font-sans">Staked Amount</span>
                      <span className="text-sm font-bold text-white">{formatCoins(wager.amount)} $VS</span>
                      <span className="text-xs text-emerald-400 block font-semibold">
                        Payout: +{formatCoins(wager.potentialReturn)} $VS
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {streamInfo && (
                        <a
                          href={streamInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${streamInfo.badgeBg} ${streamInfo.badgeText}`}
                          title={streamInfo.ctaText}
                        >
                          <Tv className="w-3.5 h-3.5 animate-pulse" />
                          <span>{streamInfo.shortName}</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}

                      {isPast && onAiVerifyOutcome && !hasAiVerified && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onAiVerifyOutcome(bet);
                          }}
                          disabled={isAiChecking}
                          className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                          title="Verify live outcome and pay out with Google Gemini"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isAiChecking ? 'animate-spin' : ''}`} />
                          <span>{isAiChecking ? 'Checking...' : 'Check Live Result'}</span>
                        </button>
                      )}

                      {isPast && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenResolve(bet);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md transition-all"
                          title="Settle duel and distribute payout"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Settle Duel</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenShare(bet, wager.side, wager.amount);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Share Bet Slip"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onViewDetails(bet);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Full Stats"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Scope B: Community Predictions (wagers made by other users across all showdowns) */}
      {activeScope === 'community' && (
        <div className="space-y-3">
          {allCommunityWagers.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No community predictions placed yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When other players take part and stake coins on showdowns, their predictions, odds, and activity will appear here in real time!
              </p>
            </div>
          ) : (
            allCommunityWagers.map(({ wager, bet }) => {
              const timing = getEventTiming(bet.startDate, bet.endDate);
              return (
                <div
                  key={wager.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        <img
                          src={wager.userAvatar}
                          alt={wager.userName}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full"
                        />
                        <span>{wager.userName}</span>
                      </div>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="capitalize text-emerald-400 font-semibold">{bet.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">
                        {timing.isLive ? '🔴 LIVE NOW' : timing.startCountdown}
                      </span>
                    </div>

                    <h4
                      onClick={() => onViewDetails(bet)}
                      className="font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {bet.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Player Backed:</span>
                      <strong className={`px-2 py-0.5 rounded text-xs font-bold ${
                        wager.side === 'X' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                      }`}>
                        Side {wager.side}: {wager.sideName}
                      </strong>
                      <span className="text-slate-400 font-mono">@{wager.oddsAtBet}x</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[11px] text-slate-400 block font-sans">Coins Staked</span>
                      <span className="text-sm font-bold text-white">{formatCoins(wager.amount)} $VS</span>
                      <span className="text-xs text-emerald-400 block font-semibold">
                        Est. Payout: +{formatCoins(wager.potentialReturn)} $VS
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onViewDetails(bet);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Showdown</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  )}

      {/* Tab 2: Past Wagers History */}
      {subTab === 'history' && (
        <div className="space-y-3">
          {pastWagers.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <History className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No settled wagers in your history yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Once duels reach their end date and creators declare outcomes, full audit reports appear here.
              </p>
            </div>
          ) : (
            pastWagers.map(({ wager, bet }) => {
              const won = wager.status === 'won';
              const refunded = wager.status === 'refunded';

              return (
                <div
                  key={wager.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      {won && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Won Prediction
                        </span>
                      )}
                      {!won && !refunded && (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Lost Prediction
                        </span>
                      )}
                      {refunded && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <RotateCcw className="w-3.5 h-3.5" /> 100% Refunded (Unresolved)
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">
                        {bet.resolvedAt ? new Date(bet.resolvedAt).toLocaleDateString() : 'Settled'}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onViewDetails(bet)}
                      className="font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {bet.title}
                    </h4>

                    <div className="text-xs text-slate-400">
                      You backed: <strong className="text-slate-200">{wager.sideName}</strong> @ {wager.oddsAtBet}x
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[11px] text-slate-400 block font-sans">Wager Payout</span>
                      {won && (
                        <span className="text-base font-extrabold text-emerald-400">
                          +{formatCoins(wager.payout || wager.potentialReturn)} $VS
                        </span>
                      )}
                      {!won && !refunded && (
                        <span className="text-base font-bold text-rose-400">
                          -{formatCoins(wager.amount)} $VS
                        </span>
                      )}
                      {refunded && (
                        <span className="text-base font-bold text-amber-400">
                          +{formatCoins(wager.amount)} $VS
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onViewDetails(bet);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View Settlement Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Created Showdowns (Support viewing duels created by all users & me) */}
      {subTab === 'created' && (
        <div className="space-y-4">
          {/* Sub-filter: All Community Created vs Created by Me */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setCreatedScope('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  createdScope === 'all'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>All Community Duels ({allCommunityCreatedBets.length})</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setCreatedScope('mine');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  createdScope === 'mine'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
                }`}
              >
                <span>Created by Me ({myCreatedBets.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenCreate();
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Duel</span>
            </button>
          </div>

          {/* Showdown List */}
          {(() => {
            const displayList = createdScope === 'all' ? allCommunityCreatedBets : myCreatedBets;

            if (displayList.length === 0) {
              return (
                <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                  <Gavel className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">
                    {createdScope === 'mine' ? 'You haven’t created any showdowns yet' : 'No community showdowns found'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Host your own head-to-head match, set rules, invite friends, and settle the outcome when time is up!
                  </p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenCreate();
                    }}
                    className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    Create Your First Duel
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {displayList.map((bet) => {
                  const time = getTimeRemaining(bet.endDate);
                  const isActive = bet.status === 'active';
                  const isMine = bet.creator.id === currentUserId;
                  const myWagerOnBet = (bet.wagers || []).find(
                    (w) => w.userId === currentUserId && w.status === 'pending'
                  );

                  return (
                    <div
                      key={bet.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {isMine ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Created by You (Host)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <img
                                src={bet.creator.avatar}
                                alt={bet.creator.name}
                                referrerPolicy="no-referrer"
                                className="w-3.5 h-3.5 rounded-full"
                              />
                              <span>Created by {bet.creator.name}</span>
                            </span>
                          )}
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="capitalize text-emerald-400 font-semibold">{bet.category}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-slate-400">
                            {isActive ? `Closes in: ${time.text}` : `Status: ${bet.status}`}
                          </span>
                        </div>

                        <h4 
                          onClick={() => onViewDetails(bet)}
                          className="font-bold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {bet.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>Total Pot: <strong className="text-amber-300">{formatCoins(bet.totalPot)} $VS</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>{bet.wagers.length} Prediction{bet.wagers.length !== 1 ? 's' : ''} Placed</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-300 font-sans">
                            {bet.sideX.name} ({bet.sideX.odds}x) vs {bet.sideY.name} ({bet.sideY.odds}x)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 shrink-0">
                        {/* If current user already placed a prediction on this showdown */}
                        {myWagerOnBet && (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs flex items-center gap-1.5 shadow-inner">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-slate-300">
                              Locked: <strong className={myWagerOnBet.side === 'X' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{myWagerOnBet.sideName}</strong> ({formatCoins(myWagerOnBet.amount)} $VS)
                            </span>
                          </div>
                        )}

                        {/* If active and no prediction placed yet: EVERYONE (creator and community) can wager! */}
                        {isActive && !myWagerOnBet && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                sound.playClick();
                                if (onQuickWager) {
                                  onQuickWager(bet, 'X');
                                } else {
                                  onViewDetails(bet);
                                }
                              }}
                              className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 truncate max-w-[140px]"
                              title={`Wager on ${bet.sideX.name}`}
                            >
                              Bet {bet.sideX.name.split(' ')[0]} ({bet.sideX.odds}x)
                            </button>

                            <button
                              onClick={() => {
                                sound.playClick();
                                if (onQuickWager) {
                                  onQuickWager(bet, 'Y');
                                } else {
                                  onViewDetails(bet);
                                }
                              }}
                              className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all active:scale-95 truncate max-w-[140px]"
                              title={`Wager on ${bet.sideY.name}`}
                            >
                              Bet {bet.sideY.name.split(' ')[0]} ({bet.sideY.odds}x)
                            </button>
                          </div>
                        )}

                        {/* Creator Settle Button */}
                        {isMine && isActive && (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onOpenResolve(bet);
                            }}
                            className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all active:scale-95"
                            title="Declare outcome & settle pot"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Settle</span>
                          </button>
                        )}

                        {!isActive && (
                          <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            {bet.status === 'resolved' ? 'Settled' : 'Cancelled'}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick();
                            onViewDetails(bet);
                          }}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
