import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Coins, 
  Users, 
  Share2, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Gavel, 
  ExternalLink,
  Flame,
  Award,
  Tv,
  Bot,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { Bet, UserProfile } from '../types';
import { calculateOdds, formatCoins, getTimeRemaining, getEventTiming, getBroadcastPlatformInfo } from '../utils/odds';
import { sound } from '../utils/audio';

interface BetDetailModalProps {
  bet: Bet;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenWager: (bet: Bet, side: 'X' | 'Y') => void;
  onOpenShare: (bet: Bet) => void;
  onOpenResolve: (bet: Bet) => void;
  onSimulateRefund: (betId: string) => void;
  onAiVerifyOutcome?: (bet: Bet) => Promise<void>;
  isAiChecking?: boolean;
  onNavigateToMyWagers?: () => void;
}

export const BetDetailModal: React.FC<BetDetailModalProps> = ({
  bet,
  user,
  isOpen,
  onClose,
  onOpenWager,
  onOpenShare,
  onOpenResolve,
  onSimulateRefund,
  onAiVerifyOutcome,
  isAiChecking = false,
  onNavigateToMyWagers,
}) => {
  if (!isOpen) return null;

  const { oddsX, oddsY, percentX, percentY } = calculateOdds(bet.sideX.pool, bet.sideY.pool);
  const timeInfo = getTimeRemaining(bet.endDate);
  const timing = getEventTiming(bet.startDate, bet.endDate);
  const streamInfo = getBroadcastPlatformInfo(
    bet.streamUrl || bet.twitchUrl,
    bet.streamPlatform,
    bet.eventLeague || bet.title
  );
  const isCreator = bet.creator.id === user.id;
  const isResolved = bet.status === 'resolved';
  const isRefunded = bet.status === 'cancelled_refunded';
  const isActive = bet.status === 'active';

  // Group wagers
  const userWagers = bet.wagers.filter((w) => w.userId === user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        {/* Banner with Scrim Header */}
        <div className="relative shrink-0">
          {bet.bannerImage ? (
            <div className="h-40 sm:h-48 w-full overflow-hidden bg-slate-950 relative">
              <img
                src={bet.bannerImage}
                alt={bet.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F141F] via-[#0F141F]/60 to-transparent" />
            </div>
          ) : (
            <div className="h-24 w-full bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800" />
          )}

          {/* Close & Share Buttons Top Right */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {streamInfo && (
              <a
                href={streamInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${streamInfo.badgeBg} ${streamInfo.badgeText}`}
                title={streamInfo.ctaText}
              >
                <Tv className="w-3.5 h-3.5 animate-pulse" />
                <span>{streamInfo.ctaText}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onOpenShare(bet);
              }}
              className="p-2 rounded-xl bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              title="Share Showdown"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title and Metadata inside Banner Area */}
          <div className="p-5 -mt-10 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              {bet.isRealWorld && (
                <span className="flex items-center gap-1 text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded-md border border-sky-500/30">
                  <Bot className="w-3 h-3" />
                  <span>Real World Showdown</span>
                </span>
              )}
              <span className="capitalize text-emerald-400">{bet.category}</span>
              <span aria-hidden="true">·</span>
              
              {timing.isLive ? (
                <span className="flex items-center gap-1 font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-0.5" />
                  LIVE NOW (Started {timing.startCountdown})
                </span>
              ) : timing.isExpired ? (
                <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Concluded · Ready to Settle
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <strong className="text-sky-300">Kickoff:</strong> {timing.startFormatted} ({timing.startCountdown})
                </span>
              )}

              {bet.eventLeague && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300">{bet.eventLeague}</span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              {bet.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Status Alert Banners */}
          {isResolved && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-emerald-300 text-sm block">
                  Official Result: {bet.outcome === 'X' ? bet.sideX.name : bet.sideY.name} Won
                </strong>
                <p className="text-slate-300 mt-1">
                  {bet.resolutionNotes || 'Winner verified by market creator. Payouts distributed.'}
                </p>
                <div className="mt-1.5 text-slate-400">
                  Resolved on: {bet.resolvedAt ? new Date(bet.resolvedAt).toLocaleString() : 'Recently'}
                </div>
              </div>
            </div>
          )}

          {isRefunded && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-300 text-sm block">
                  Match Cancelled & 100% Refunded
                </strong>
                <p className="text-slate-300 mt-1">
                  {bet.resolutionNotes || 'Outcome not verified before expiration deadline. All wagers returned in full.'}
                </p>
              </div>
            </div>
          )}

          {/* Event Schedule & Kickoff Timing Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Event Kickoff / Start Time
                </span>
                <span className="font-bold text-slate-200 text-sm block mt-0.5">
                  {timing.startFormatted}
                </span>
                <span className={`text-[11px] font-semibold mt-1 inline-flex items-center gap-1 ${
                  timing.isLive ? 'text-rose-400' : timing.isExpired ? 'text-slate-400' : 'text-sky-300'
                }`}>
                  {timing.isLive ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Started {timing.startCountdown} (LIVE NOW)
                    </>
                  ) : timing.isExpired ? (
                    'Kickoff Concluded'
                  ) : (
                    `⏱️ ${timing.startCountdown}`
                  )}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Resolution / Result Deadline
                </span>
                <span className="font-bold text-slate-200 text-sm block mt-0.5">
                  {new Date(bet.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(bet.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`text-[11px] font-semibold mt-1 block ${
                  timing.isExpired ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {timing.isExpired ? '⚠️ Deadline Passed · Ready to Settle' : `⏳ ${timing.endCountdown}`}
                </span>
              </div>
            </div>
          </div>

          {/* Authentic Broadcast & Tune-In Card (Replaces generic Twitch hardcode) */}
          {streamInfo && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md bg-slate-950/80 ${streamInfo.badgeBorder}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${streamInfo.badgeBg}`}>
                  <Tv className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Official Live Coverage
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${streamInfo.badgeBg} ${streamInfo.badgeText}`}>
                      {streamInfo.name}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    {timing.isLive ? '🔴 Stream is LIVE NOW — Tune In to Watch!' : `Tune in on ${streamInfo.shortName} when the event kicks off`}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Stream official broadcast to follow action and results in real time.
                  </p>
                </div>
              </div>

              <a
                href={streamInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md ${streamInfo.badgeBg} ${streamInfo.badgeText}`}
              >
                <span>{streamInfo.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Real-World Gemini Search Oracle Verification Card */}
          {((isActive && onAiVerifyOutcome) || bet.lastAiCheck) && (
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                    Google Gemini Search Oracle
                  </span>
                </div>
                {isActive && onAiVerifyOutcome && (
                  <button
                    type="button"
                    disabled={isAiChecking}
                    onClick={() => {
                      sound.playClick();
                      onAiVerifyOutcome(bet);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAiChecking ? 'animate-spin' : ''}`} />
                    <span>{isAiChecking ? 'Checking Grounding...' : 'Check Live Result with Search'}</span>
                  </button>
                )}
              </div>

              {bet.lastAiCheck ? (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verified: {new Date(bet.lastAiCheck.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-bold ${bet.lastAiCheck.concluded ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {bet.lastAiCheck.concluded ? 'Official Result Verified' : 'Match Scheduled / In Progress'}
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed font-sans">
                    {bet.lastAiCheck.summary}
                  </p>

                  {bet.lastAiCheck.source && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">Source:</span>
                      <a
                        href={bet.lastAiCheck.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-semibold truncate max-w-xs"
                      >
                        <span className="truncate">{bet.lastAiCheck.source}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {isActive && bet.lastAiCheck.concluded && bet.lastAiCheck.winner && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-bold">
                        Winner Detected: Side {bet.lastAiCheck.winner} ({bet.lastAiCheck.winner === 'X' ? bet.sideX.name : bet.sideY.name})
                      </span>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onOpenResolve(bet);
                        }}
                        className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                      >
                        Settle Payouts Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Click to perform an instant Google Search via Gemini to check if this match has finished in real life and verify the winner.
                </p>
              )}
            </div>
          )}

          {/* Head to Head Duel Statistics Comparison Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-3">
              Showdown Statistics & Liquidity
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Side X Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span>SIDE X</span>
                  <span className="text-sm font-mono">{oddsX}x</span>
                </div>
                <div className="font-bold text-sm text-white mb-2">
                  {bet.sideX.avatarOrFlag && <span className="mr-1">{bet.sideX.avatarOrFlag}</span>}
                  {bet.sideX.name}
                </div>
                <div className="text-xs space-y-1 text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Pool:</span>
                    <strong className="text-slate-200">{formatCoins(bet.sideX.pool)} $VS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Predictors:</span>
                    <span className="text-slate-200">{bet.sideX.bettorsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pool Share:</span>
                    <span className="text-emerald-400">{percentX}%</span>
                  </div>
                </div>
              </div>

              {/* Side Y Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2">
                  <span>SIDE Y</span>
                  <span className="text-sm font-mono">{oddsY}x</span>
                </div>
                <div className="font-bold text-sm text-white mb-2">
                  {bet.sideY.avatarOrFlag && <span className="mr-1">{bet.sideY.avatarOrFlag}</span>}
                  {bet.sideY.name}
                </div>
                <div className="text-xs space-y-1 text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Pool:</span>
                    <strong className="text-slate-200">{formatCoins(bet.sideY.pool)} $VS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Predictors:</span>
                    <span className="text-slate-200">{bet.sideY.bettorsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pool Share:</span>
                    <span className="text-rose-400">{percentY}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Bar */}
            <div className="mt-3">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500" style={{ width: `${percentX}%` }} />
                <div className="bg-rose-500" style={{ width: `${percentY}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Total Pot: <strong className="text-amber-300 font-bold">{formatCoins(bet.totalPot)} $VS</strong></span>
                <span>Average Wager: <strong className="font-mono text-slate-200">{bet.wagers.length > 0 ? formatCoins(Math.round(bet.totalPot / bet.wagers.length)) : '0'} $VS</strong></span>
              </div>
            </div>
          </div>

          {/* Rules & Resolution Criteria */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Resolution Rulebook & Verification Terms
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bet.rules}
            </p>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <img
                  src={bet.creator.avatar}
                  alt={bet.creator.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full"
                />
                <span>Created by <strong className="text-slate-200">{isCreator ? `${bet.creator.name} (You)` : bet.creator.name}</strong></span>
              </div>
              <span className="text-[11px]">End Date: {new Date(bet.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* User's Current Wagers on This Match (if any) */}
          {userWagers.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block mb-2">
                Your Predictions on This Duel
              </span>
              <div className="space-y-2">
                {userWagers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/80">
                    <div>
                      <span className="font-bold text-white">Side {w.side}: {w.sideName}</span>
                      <span className="text-slate-400 text-[10px] block font-sans">
                        Staked {formatCoins(w.amount)} $VS @ {w.oddsAtBet}x
                      </span>
                    </div>
                    <div className="text-right">
                      {w.status === 'won' && (
                        <span className="font-bold text-emerald-400">Won +{formatCoins(w.payout || 0)} $VS</span>
                      )}
                      {w.status === 'lost' && (
                        <span className="font-bold text-rose-400">Lost</span>
                      )}
                      {w.status === 'refunded' && (
                        <span className="font-bold text-amber-400">Refunded {formatCoins(w.amount)} $VS</span>
                      )}
                      {w.status === 'pending' && (
                        <span className="font-bold text-cyan-400">Projected: +{formatCoins(w.potentialReturn)} $VS</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wager Activity / Predictor Roster */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
              Recent Predictor Activity ({bet.wagers.length} total wagers)
            </span>
            {bet.wagers.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Be the first predictor to take a side in this showdown!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bet.wagers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/40">
                    <div className="flex items-center gap-2">
                      <img
                        src={w.userAvatar}
                        alt={w.userName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="font-semibold text-slate-200">{w.userName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        w.side === 'X' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        Side {w.side}
                      </span>
                    </div>
                    <div className="font-mono text-slate-300">
                      <strong>{formatCoins(w.amount)}</strong> $VS
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settlement Portal Controls (Available for Creators, Expired Duels, and Verified Matches) */}
          {isActive && (isCreator || timeInfo.isExpired || bet.isRealWorld || !!bet.lastAiCheck?.concluded) && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Gavel className="w-4 h-4 text-amber-400" />
                  <span>{isCreator ? 'Creator Settlement Portal' : 'Showdown Settlement & Payout Portal'}</span>
                </div>
                {timeInfo.isExpired && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Deadline Passed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {timeInfo.isExpired
                  ? 'This showdown’s resolution deadline has passed. Settle the duel now to distribute pool winnings to all winning predictors.'
                  : 'As creator, declare the verified winner or refund all participants.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {bet.lastAiCheck?.concluded && bet.lastAiCheck.winner ? (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenResolve(bet);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settle Payouts: {bet.lastAiCheck.winner === 'X' ? bet.sideX.name : bet.sideY.name} Won</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenResolve(bet);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Declare Winner & Settle Pot</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    onSimulateRefund(bet.id);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  title="Simulate missed deadline auto-refund rule"
                >
                  Refund 100% Stakes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#0B0E14] flex items-center gap-2 sm:gap-3 shrink-0 pb-[max(14px,env(safe-area-inset-bottom,14px))]">
          {isActive && !timeInfo.isExpired ? (
            userWagers.length > 0 && userWagers.some((w) => w.status === 'pending') ? (
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs shadow-inner">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">
                      Prediction Locked: <strong className={userWagers[0].side === 'X' ? 'text-emerald-400' : 'text-rose-400'}>{userWagers[0].sideName}</strong>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCoins(userWagers[0].amount)} $VS
                  </span>
                </div>
                {onNavigateToMyWagers && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onClose();
                      onNavigateToMyWagers();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>View in My Wagers</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenWager(bet, 'X');
                  }}
                  className="flex-1 min-h-[46px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all active:scale-98 truncate flex items-center justify-center shadow-md shadow-emerald-500/20"
                >
                  Bet {bet.sideX.name.split(' ')[0]} ({oddsX}x)
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenWager(bet, 'Y');
                  }}
                  className="flex-1 min-h-[46px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-rose-500 hover:bg-rose-400 text-white transition-all active:scale-98 truncate flex items-center justify-center shadow-md shadow-rose-500/20"
                >
                  Bet {bet.sideY.name.split(' ')[0]} ({oddsY}x)
                </button>
              </>
            )
          ) : isActive && timeInfo.isExpired ? (
            <>
              {onAiVerifyOutcome && (!bet.lastAiCheck?.concluded || !bet.lastAiCheck.winner) ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onAiVerifyOutcome(bet);
                  }}
                  disabled={isAiChecking}
                  className="flex-1 min-h-[46px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                >
                  <Bot className={`w-4 h-4 ${isAiChecking ? 'animate-spin' : ''}`} />
                  <span>{isAiChecking ? 'Checking Grounding...' : '🤖 Check Live Result with Search & Settle'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenResolve(bet);
                  }}
                  className="flex-1 min-h-[46px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>⚡ Settle Duel & Distribute Payouts Now</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenShare(bet);
              }}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Settled Match Outcome</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
