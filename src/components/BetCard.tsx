import React from 'react';
import { 
  Users, 
  Coins, 
  Clock, 
  Share2, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Tv,
  ExternalLink,
  Bot
} from 'lucide-react';
import { Bet } from '../types';
import { calculateOdds, formatCoins, getTimeRemaining } from '../utils/odds';
import { sound } from '../utils/audio';

interface BetCardProps {
  bet: Bet;
  onQuickWager: (bet: Bet, side: 'X' | 'Y') => void;
  onViewDetails: (bet: Bet) => void;
  onShare: (bet: Bet) => void;
}

export const BetCard: React.FC<BetCardProps> = ({
  bet,
  onQuickWager,
  onViewDetails,
  onShare,
}) => {
  const { oddsX, oddsY, percentX, percentY } = calculateOdds(bet.sideX.pool, bet.sideY.pool);
  const timeInfo = getTimeRemaining(bet.endDate);
  const totalBettors = (bet.sideX.bettorsCount || 0) + (bet.sideY.bettorsCount || 0);

  const isResolved = bet.status === 'resolved';
  const isRefunded = bet.status === 'cancelled_refunded';
  const isActive = bet.status === 'active';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50">
      {/* Top Banner or Subtle Header */}
      {bet.bannerImage ? (
        <div className="relative h-32 w-full overflow-hidden bg-slate-950">
          <img
            src={bet.bannerImage}
            alt={bet.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          {/* Top Unboxed Metadata Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-medium drop-shadow-md">
            <div className="flex items-center gap-2">
              <span className="capitalize font-semibold text-emerald-400">{bet.category}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-slate-400" />
                {timeInfo.text}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {bet.twitchUrl && (
                <a
                  href={bet.twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-white font-bold text-[10px] shadow-sm transition-transform active:scale-95 ${
                    bet.twitchUrl.toLowerCase().includes('bbc') || bet.twitchUrl.toLowerCase().includes('iplayer')
                      ? 'bg-red-600/90 hover:bg-red-600'
                      : bet.twitchUrl.toLowerCase().includes('twitch')
                      ? 'bg-[#9146FF]/90 hover:bg-[#9146FF]'
                      : 'bg-sky-600/90 hover:bg-sky-600'
                  }`}
                  title={
                    bet.twitchUrl.toLowerCase().includes('bbc') || bet.twitchUrl.toLowerCase().includes('iplayer')
                      ? 'Watch on BBC iPlayer'
                      : 'Watch Broadcast'
                  }
                >
                  <Tv className="w-3 h-3 animate-pulse" />
                  <span>
                    {bet.twitchUrl.toLowerCase().includes('bbc') || bet.twitchUrl.toLowerCase().includes('iplayer')
                      ? 'BBC iPlayer'
                      : bet.twitchUrl.toLowerCase().includes('twitch')
                      ? 'Twitch'
                      : 'Watch Live'}
                  </span>
                </a>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onShare(bet);
                }}
                className="p-1.5 rounded-lg bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                title="Share Showdown"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="capitalize font-semibold text-emerald-400">{bet.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {timeInfo.text}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {bet.twitchUrl && (
              <a
                href={bet.twitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#9146FF] text-white font-bold text-[10px] shadow-sm"
                title="Watch Live on Twitch"
              >
                <Tv className="w-3 h-3 animate-pulse" />
                <span>Twitch</span>
              </a>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onShare(bet);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title="Share Showdown"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Title & Real World Badge */}
        <div>
          {bet.isRealWorld && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 mb-1">
              <Bot className="w-3 h-3 text-sky-400" />
              <span>Real-World Pro Match · Gemini Grounded</span>
            </div>
          )}

          <h3 
            onClick={() => onViewDetails(bet)}
            className="font-bold text-base sm:text-lg text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug tracking-tight"
          >
            {bet.title}
          </h3>

          {/* Status Alert if Resolved or Refunded */}
          {isResolved && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resolved: {bet.outcome === 'X' ? bet.sideX.name : bet.sideY.name} Won</span>
            </div>
          )}

          {isRefunded && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Outcome Unverified · 100% Wagers Returned</span>
            </div>
          )}
        </div>

        {/* Head-to-Head Showdown Grid */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Side X */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-200 truncate" title={bet.sideX.name}>
                  {bet.sideX.avatarOrFlag && <span className="mr-1">{bet.sideX.avatarOrFlag}</span>}
                  {bet.sideX.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Side X</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono tabular-nums text-sm font-extrabold text-emerald-400">
                  {oddsX}x
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {percentX}%
                </span>
              </div>
            </div>

            {/* Side Y */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-200 truncate" title={bet.sideY.name}>
                  {bet.sideY.avatarOrFlag && <span className="mr-1">{bet.sideY.avatarOrFlag}</span>}
                  {bet.sideY.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-rose-400">Side Y</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono tabular-nums text-sm font-extrabold text-rose-400">
                  {oddsY}x
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {percentY}%
                </span>
              </div>
            </div>
          </div>

          {/* Visual Pool Tug-of-War Bar */}
          <div className="mt-3">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 transition-all duration-500" 
                style={{ width: `${Math.max(5, Math.min(95, percentX))}%` }} 
              />
              <div 
                className="bg-rose-500 transition-all duration-500" 
                style={{ width: `${Math.max(5, Math.min(95, percentY))}%` }} 
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Coins className="w-3 h-3 text-amber-400" />
                {formatCoins(bet.totalPot)} $VS Pot
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                {totalBettors} Predictors
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
          {isActive ? (
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  onQuickWager(bet, 'X');
                }}
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 transition-all active:scale-95 truncate text-center"
              >
                Bet {bet.sideX.name.split(' ')[0]} ({oddsX}x)
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onQuickWager(bet, 'Y');
                }}
                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 transition-all active:scale-95 truncate text-center"
              >
                Bet {bet.sideY.name.split(' ')[0]} ({oddsY}x)
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onViewDetails(bet);
                }}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="View Match Stats & Details"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onViewDetails(bet);
              }}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>View Settlement & Audit Breakdown</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
