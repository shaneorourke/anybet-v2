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
  Sparkles
} from 'lucide-react';
import { Bet, UserProfile, Wager } from '../types';
import { formatCoins, getTimeRemaining } from '../utils/odds';
import { sound } from '../utils/audio';

interface MyBetsDashboardProps {
  user: UserProfile;
  bets: Bet[];
  onOpenCreate: () => void;
  onOpenResolve: (bet: Bet) => void;
  onOpenShare: (bet: Bet, side: 'X' | 'Y', amount: number) => void;
  onViewDetails: (bet: Bet) => void;
}

export const MyBetsDashboard: React.FC<MyBetsDashboardProps> = ({
  user,
  bets,
  onOpenCreate,
  onOpenResolve,
  onOpenShare,
  onViewDetails,
}) => {
  const [subTab, setSubTab] = useState<'active' | 'history' | 'created'>('active');

  // Extract all user wagers across all bets
  const allUserWagers: { wager: Wager; bet: Bet }[] = [];
  bets.forEach((b) => {
    b.wagers.forEach((w) => {
      if (w.userId === user.id) {
        allUserWagers.push({ wager: w, bet: b });
      }
    });
  });

  const activeWagers = allUserWagers.filter((item) => item.bet.status === 'active');
  const pastWagers = allUserWagers.filter((item) => item.bet.status !== 'active');
  const createdBets = bets.filter((b) => b.creator.isCurrentUser || b.creator.id === user.id);

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
          <span>Active Wagers ({activeWagers.length})</span>
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
          <span>Past Wagers ({pastWagers.length})</span>
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
          <span>Created Duels ({createdBets.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Wagers */}
      {subTab === 'active' && (
        <div className="space-y-3">
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
              const time = getTimeRemaining(bet.endDate);
              return (
                <div
                  key={wager.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="capitalize text-emerald-400 font-semibold">{bet.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {time.text}
                      </span>
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

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-[11px] text-slate-400 block font-sans">Staked Amount</span>
                      <span className="text-sm font-bold text-white">{formatCoins(wager.amount)} $VS</span>
                      <span className="text-xs text-emerald-400 block font-semibold">
                        Payout: +{formatCoins(wager.potentialReturn)} $VS
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
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

      {/* Tab 3: Created Showdowns */}
      {subTab === 'created' && (
        <div className="space-y-3">
          {createdBets.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Gavel className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">You haven’t created any showdowns yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Host your own head-to-head match, set rules, invite friends, and settle the outcome when time is up!
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCreate();
                }}
                className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Create Your First Duel
              </button>
            </div>
          ) : (
            createdBets.map((bet) => {
              const time = getTimeRemaining(bet.endDate);
              const isActive = bet.status === 'active';

              return (
                <div
                  key={bet.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300">
                        Creator Role
                      </span>
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

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>Total Pot: <strong className="text-amber-300">{formatCoins(bet.totalPot)} $VS</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{bet.wagers.length} Participants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    {isActive ? (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenResolve(bet);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Settle Duel</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 px-3 py-1.5 rounded-lg bg-slate-950">
                        Settled
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
            })
          )}
        </div>
      )}
    </div>
  );
};
