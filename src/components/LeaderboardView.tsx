import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Coins, 
  TrendingUp, 
  Medal, 
  Award,
  Crown
} from 'lucide-react';
import { LeaderboardUser, UserProfile } from '../types';
import { formatCoins } from '../utils/odds';
import { sound } from '../utils/audio';

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
  user: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  user,
}) => {
  const [filter, setFilter] = useState<'profit' | 'winrate' | 'streak'>('profit');

  // Sort based on selected metric
  const sorted = [...leaderboard].sort((a, b) => {
    if (filter === 'profit') return b.profit - a.profit;
    if (filter === 'winrate') return b.winRate - a.winRate;
    return b.streak - a.streak;
  });

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>Global Predictor Rankings</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              The Oracle Leaderboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Top predictors ranked by net fake coin profits, accuracy percentage, and active consecutive win streaks.
            </p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setFilter('profit');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'profit'
                  ? 'bg-slate-800 text-yellow-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Net Profit
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter('winrate');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'winrate'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Win Rate %
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter('streak');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'streak'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Win Streak
            </button>
          </div>
        </div>

        {/* Podium Top 3 */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80 items-end">
            {/* Rank 2 (Silver) */}
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center relative order-1 sm:order-1">
              <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                2
              </div>
              <img
                src={top3[1].avatar}
                alt={top3[1].name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border-2 border-slate-400 mb-2 mt-1"
              />
              <span className="font-bold text-xs sm:text-sm text-white truncate w-full">
                {top3[1].name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">@{top3[1].username}</span>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                +{formatCoins(top3[1].profit)} $VS
              </div>
            </div>

            {/* Rank 1 (Gold - Elevated) */}
            <div className="flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-slate-950 border border-yellow-500/40 text-center relative -mt-4 shadow-xl shadow-yellow-500/5 order-2 sm:order-2">
              <Crown className="w-6 h-6 text-yellow-400 mb-1" />
              <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                1
              </div>
              <img
                src={top3[0].avatar}
                alt={top3[0].name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-yellow-400 mb-2"
              />
              <span className="font-extrabold text-sm sm:text-base text-white truncate w-full">
                {top3[0].name}
              </span>
              <span className="text-[11px] text-yellow-400/90 font-semibold">{top3[0].badge}</span>
              <div className="mt-2 text-sm sm:text-base font-mono font-black text-yellow-300">
                +{formatCoins(top3[0].profit)} $VS
              </div>
              <span className="text-[10px] text-slate-400">{top3[0].winRate}% Win Rate</span>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center relative order-3 sm:order-3">
              <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                3
              </div>
              <img
                src={top3[2].avatar}
                alt={top3[2].name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border-2 border-amber-700 mb-2 mt-1"
              />
              <span className="font-bold text-xs sm:text-sm text-white truncate w-full">
                {top3[2].name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">@{top3[2].username}</span>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                +{formatCoins(top3[2].profit)} $VS
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ranks Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center">Rank</span>
            <span>Predictor</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-12 text-right">
            <span className="hidden sm:inline">Win Rate</span>
            <span className="hidden sm:inline">Streak</span>
            <span>Net Profit</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {sorted.map((item, index) => {
            const isCurrentUser = item.id === user.id;
            return (
              <div
                key={item.id}
                className={`px-5 py-3.5 flex items-center justify-between text-xs transition-colors ${
                  isCurrentUser
                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank & User */}
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-mono font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">@{item.username}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-6 sm:gap-12 text-right font-mono">
                  <div className="hidden sm:block">
                    <span className="text-slate-200 font-bold">{item.winRate}%</span>
                    <span className="text-[10px] text-slate-500 block font-sans">
                      {item.betsWon}/{item.betsTotal} won
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{item.streak}W</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">
                      +{formatCoins(item.profit)} $VS
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Balance: {formatCoins(item.balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
