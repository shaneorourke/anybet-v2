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
import { Bet, UserProfile } from '../types';
import { calculateOdds, formatCoins, getTimeRemaining, getEventTiming, getBroadcastPlatformInfo } from '../utils/odds';
import { sound } from '../utils/audio';

interface BetCardProps {
  bet: Bet;
  onQuickWager: (bet: Bet, side: 'X' | 'Y') => void;
  onViewDetails: (bet: Bet) => void;
  onShare: (bet: Bet) => void;
  onAiVerifyOutcome?: (bet: Bet) => Promise<void>;
  onOpenResolve?: (bet: Bet) => void;
  isAiChecking?: boolean;
  currentUser?: UserProfile;
}

export const BetCard: React.FC<BetCardProps> = ({
  bet,
  onQuickWager,
  onViewDetails,
  onShare,
  onAiVerifyOutcome,
  onOpenResolve,
  isAiChecking = false,
  currentUser,
}) => {
  const { oddsX, oddsY, percentX, percentY } = calculateOdds(bet.sideX.pool, bet.sideY.pool);
  const timeInfo = getTimeRemaining(bet.endDate);
  const timing = getEventTiming(bet.startDate, bet.endDate);
  const streamInfo = getBroadcastPlatformInfo(
    bet.streamUrl || bet.twitchUrl,
    bet.streamPlatform,
    bet.eventLeague || bet.title
  );
  const totalBettors = (bet.sideX.bettorsCount || 0) + (bet.sideY.bettorsCount || 0);

  const isResolved = bet.status === 'resolved';
  const isRefunded = bet.status === 'cancelled_refunded';
  const isExpired = timing.isExpired;
  const isActive = bet.status === 'active';
  const canBet = isActive && !isExpired;

  // Single-prediction per duel enforcement: Check if user already predicted on this duel
  const userWager = currentUser 
    ? bet.wagers.find(
        (w) =>
          w.userId === currentUser.id ||
          w.userId === 'user_current' ||
          (currentUser.name && w.userName === currentUser.name)
      ) 
    : undefined;
  const hasAlreadyBet = !!userWager;

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
          
          {/* Top Metadata Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 font-medium drop-shadow-md">
            <div className="flex items-center gap-2">
              <span className="capitalize font-semibold text-emerald-400">{bet.category}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              {timing.isLive ? (
                <span className="flex items-center gap-1 font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-0.5" />
                  LIVE NOW
                </span>
              ) : timing.isExpired ? (
                <span className="text-amber-400 font-semibold text-[10px]">Concluded</span>
              ) : (
                <span className="flex items-center gap-1 text-slate-300 text-[10px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {timing.startCountdown || timeInfo.text}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {streamInfo && (
                <a
                  href={streamInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold text-[10px] shadow-sm transition-transform active:scale-95 ${streamInfo.badgeBg} ${streamInfo.badgeText}`}
                  title={streamInfo.ctaText}
                >
                  <Tv className="w-3 h-3 animate-pulse" />
                  <span>{streamInfo.shortName}</span>
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
            {timing.isLive ? (
              <span className="flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-0.5" />
                LIVE NOW
              </span>
            ) : timing.isExpired ? (
              <span className="text-amber-400 font-semibold text-[10px]">Concluded</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px]">
                <Clock className="w-3 h-3 text-slate-500" />
                {timing.startCountdown || timeInfo.text}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {streamInfo && (
              <a
                href={streamInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-sm ${streamInfo.badgeBg} ${streamInfo.badgeText}`}
                title={streamInfo.ctaText}
              >
                <Tv className="w-3 h-3 animate-pulse" />
                <span>{streamInfo.shortName}</span>
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
        {/* Title & Creator / Real World Badge */}
        <div>
          {bet.isRealWorld ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 mb-1">
              <Bot className="w-3 h-3 text-sky-400" />
              <span>Real-World Pro Match · Gemini Grounded</span>
            </div>
          ) : bet.creator && bet.creator.id !== 'oracle_ai' ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 mb-1">
              <Users className="w-3 h-3 text-purple-400" />
              <span>Community Duel · Created by {currentUser && bet.creator.id === currentUser.id ? `${bet.creator.name} (You)` : bet.creator.name}</span>
            </div>
          ) : null}

          <h3 
            onClick={() => onViewDetails(bet)}
            className="font-bold text-base sm:text-lg text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug tracking-tight"
          >
            {bet.title}
          </h3>

          {/* Event Kickoff & Tune-In Schedule Indicator */}
          <div className="mt-2 py-1 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">
                {timing.isLive ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    LIVE NOW · Tune In!
                  </span>
                ) : timing.isExpired ? (
                  <span className="text-slate-400">Aired / Concluded</span>
                ) : (
                  <span>
                    Starts: <strong className="text-slate-200">{timing.startFormatted}</strong> ({timing.startCountdown})
                  </span>
                )}
              </span>
            </div>
            {streamInfo && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 shadow-sm ${streamInfo.badgeBg} ${streamInfo.badgeText}`}>
                {streamInfo.shortName}
              </span>
            )}
          </div>

          {/* Status Alert if Resolved, Refunded, or Awaiting Settlement */}
          {isResolved && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resolved: {bet.outcome === 'X' ? bet.sideX.name : bet.sideY.name} Won</span>
            </div>
          )}

          {isRefunded && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Outcome Unverified · 100% Wagers Returned</span>
            </div>
          )}

          {!isResolved && !isRefunded && bet.lastAiCheck?.concluded && bet.lastAiCheck.winner && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1.5 rounded-lg border border-sky-500/20">
              <Bot className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Gemini Verified: {bet.lastAiCheck.winner === 'X' ? bet.sideX.name : bet.sideY.name} Won (Ready to Settle)</span>
            </div>
          )}

          {!isResolved && !isRefunded && isExpired && !bet.lastAiCheck?.concluded && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Deadline Passed · Awaiting Result Settlement</span>
            </div>
          )}
        </div>

        {/* Head-to-Head Showdown Grid */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Side X - Tap-to-wager on mobile */}
            <div 
              onClick={() => {
                if (canBet && !hasAlreadyBet) {
                  sound.playClick();
                  onQuickWager(bet, 'X');
                } else {
                  onViewDetails(bet);
                }
              }}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                userWager?.side === 'X'
                  ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-[0.98]'
                  : canBet && !hasAlreadyBet
                  ? 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/50 cursor-pointer active:scale-[0.98]' 
                  : 'bg-slate-950/70 border-slate-800/60 cursor-pointer'
              }`}
              title={hasAlreadyBet ? `Your locked prediction: ${bet.sideX.name}` : canBet ? `Click to wager on ${bet.sideX.name}` : bet.sideX.name}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-200 truncate" title={bet.sideX.name}>
                  {bet.sideX.avatarOrFlag && <span className="mr-1">{bet.sideX.avatarOrFlag}</span>}
                  {bet.sideX.name}
                </span>
                {userWager?.side === 'X' ? (
                  <span className="text-[9px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                    ✓ Your Pick
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Side X</span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-emerald-400">
                  {oddsX}x
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {percentX}%
                </span>
              </div>
            </div>

            {/* Side Y - Tap-to-wager on mobile */}
            <div 
              onClick={() => {
                if (canBet && !hasAlreadyBet) {
                  sound.playClick();
                  onQuickWager(bet, 'Y');
                } else {
                  onViewDetails(bet);
                }
              }}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                userWager?.side === 'Y'
                  ? 'bg-rose-500/15 border-rose-500 shadow-md shadow-rose-500/10 cursor-pointer active:scale-[0.98]'
                  : canBet && !hasAlreadyBet
                  ? 'bg-slate-950/70 border-slate-800 hover:border-rose-500/50 cursor-pointer active:scale-[0.98]' 
                  : 'bg-slate-950/70 border-slate-800/60 cursor-pointer'
              }`}
              title={hasAlreadyBet ? `Your locked prediction: ${bet.sideY.name}` : canBet ? `Click to wager on ${bet.sideY.name}` : bet.sideY.name}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-200 truncate" title={bet.sideY.name}>
                  {bet.sideY.avatarOrFlag && <span className="mr-1">{bet.sideY.avatarOrFlag}</span>}
                  {bet.sideY.name}
                </span>
                {userWager?.side === 'Y' ? (
                  <span className="text-[9px] uppercase font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 shrink-0">
                    ✓ Your Pick
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-rose-400">Side Y</span>
                )}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono tabular-nums text-sm sm:text-base font-extrabold text-rose-400">
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
          {canBet ? (
            hasAlreadyBet ? (
              <>
                <div 
                  onClick={() => {
                    sound.playClick();
                    onViewDetails(bet);
                  }}
                  className="flex-1 min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-500/70 text-xs shadow-inner cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 truncate">
                      Prediction Locked: <strong className={userWager.side === 'X' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{userWager.sideName}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0 ml-2">
                    {formatCoins(userWager.amount)} $VS
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onViewDetails(bet);
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                  title="View Match Details"
                >
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  <span className="hidden xs:inline">Details</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    sound.playClick();
                    onQuickWager(bet, 'X');
                  }}
                  className="flex-1 min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 transition-all active:scale-95 truncate text-center flex items-center justify-center"
                >
                  Bet {bet.sideX.name.split(' ')[0]} ({oddsX}x)
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onQuickWager(bet, 'Y');
                  }}
                  className="flex-1 min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 transition-all active:scale-95 truncate text-center flex items-center justify-center"
                >
                  Bet {bet.sideY.name.split(' ')[0]} ({oddsY}x)
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onViewDetails(bet);
                  }}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
                  title="View Match Stats & Details"
                  aria-label="View Match Details"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </>
            )
          ) : isActive && isExpired ? (
            <>
              {onAiVerifyOutcome && (!bet.lastAiCheck?.concluded || !bet.lastAiCheck.winner) ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onAiVerifyOutcome(bet);
                  }}
                  disabled={isAiChecking}
                  className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Check Real-World Outcome via Google Gemini & BBC Grounding"
                >
                  <Bot className={`w-3.5 h-3.5 ${isAiChecking ? 'animate-spin' : ''}`} />
                  <span>{isAiChecking ? 'Checking Result...' : '🤖 Check Live Result & Payout'}</span>
                </button>
              ) : onOpenResolve ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenResolve(bet);
                  }}
                  className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>⚡ Settle Duel & Distribute Pot</span>
                </button>
              ) : null}

              <button
                onClick={() => {
                  sound.playClick();
                  onViewDetails(bet);
                }}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                title="View Details"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Details</span>
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
