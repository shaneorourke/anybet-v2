import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Share2,
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bet, UserProfile } from '../types';
import { calculateOdds, calculateProjectedReturn, formatCoins } from '../utils/odds';
import { sound } from '../utils/audio';

interface WagerModalProps {
  bet: Bet;
  initialSide: 'X' | 'Y';
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWager: (betId: string, side: 'X' | 'Y', amount: number) => void;
  onOpenShare: (bet: Bet, side: 'X' | 'Y', amount: number) => void;
}

export const WagerModal: React.FC<WagerModalProps> = ({
  bet,
  initialSide,
  user,
  isOpen,
  onClose,
  onConfirmWager,
  onOpenShare,
}) => {
  if (!isOpen) return null;

  const [selectedSide, setSelectedSide] = useState<'X' | 'Y'>(initialSide);
  const [amount, setAmount] = useState<number>(100);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastWagerInfo, setLastWagerInfo] = useState<{ amount: number; side: 'X' | 'Y' } | null>(null);

  const { oddsX, oddsY } = calculateOdds(bet.sideX.pool, bet.sideY.pool);
  const currentOdds = selectedSide === 'X' ? oddsX : oddsY;
  const currentSideObj = selectedSide === 'X' ? bet.sideX : bet.sideY;

  const { projectedReturn, projectedProfit, effectiveOdds } = calculateProjectedReturn(
    selectedSide,
    amount,
    bet.sideX.pool,
    bet.sideY.pool
  );

  const handleQuickAdd = (value: number) => {
    sound.playClick();
    setAmount((prev) => Math.min(user.balance, Math.max(10, prev + value)));
  };

  const handleSetMax = () => {
    sound.playClick();
    setAmount(Math.max(10, user.balance));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > user.balance) return;

    sound.playBetPlaced();
    sound.triggerHaptic();

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: selectedSide === 'X' ? ['#10B981', '#06B6D4', '#FFFFFF'] : ['#F43F5E', '#FB7185', '#FFFFFF'],
      });
    } catch {}

    onConfirmWager(bet.id, selectedSide, amount);
    setLastWagerInfo({ amount, side: selectedSide });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Interactive Bet Slip
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
              {bet.title}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Pick Selection Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Select Your Winning Side
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedSide('X');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSide === 'X'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                    <span>SIDE X</span>
                    <span className="font-mono">{oddsX}x</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-100 truncate">
                    {bet.sideX.avatarOrFlag && <span className="mr-1">{bet.sideX.avatarOrFlag}</span>}
                    {bet.sideX.name}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedSide('Y');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSide === 'Y'
                      ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
                    <span>SIDE Y</span>
                    <span className="font-mono">{oddsY}x</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-100 truncate">
                    {bet.sideY.avatarOrFlag && <span className="mr-1">{bet.sideY.avatarOrFlag}</span>}
                    {bet.sideY.name}
                  </div>
                </button>
              </div>
            </div>

            {/* Wager Amount Input & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400">
                  Wager Amount ($VS Coins)
                </label>
                <span className="text-xs font-medium text-slate-400">
                  Available: <strong className="font-mono text-amber-300">{formatCoins(user.balance)}</strong> $VS
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max={user.balance}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-800 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Coins className="w-4 h-4" />
                  <span>$VS</span>
                </div>
              </div>

              {/* Quick Increment Buttons */}
              <div className="mt-2.5 flex items-center gap-2">
                {[25, 50, 100, 250].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAdd(val)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Projected Returns Breakdown Card */}
            <div className="rounded-xl bg-slate-950/80 p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Selected Pick:</span>
                <span className="font-semibold text-white">
                  {currentSideObj.name} ({effectiveOdds}x)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Potential Return:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {formatCoins(projectedReturn)} $VS Coins
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Net Estimated Profit:</span>
                <span className="font-mono font-semibold text-emerald-300">
                  +{formatCoins(projectedProfit)} $VS (+{Math.round(((projectedReturn - amount) / (amount || 1)) * 100)}%)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero real money risk. Wagers refunded if unresolved by deadline.</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={amount <= 0 || amount > user.balance}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                amount > 0 && amount <= user.balance
                  ? selectedSide === 'X'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-98'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Place {amount} $VS Wager</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Confirmation & Share Flow */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Prediction Placed!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You staked <strong className="text-emerald-400 font-mono">{lastWagerInfo?.amount} $VS</strong> on{' '}
                <strong className="text-white">
                  {lastWagerInfo?.side === 'X' ? bet.sideX.name : bet.sideY.name}
                </strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenShare(bet, lastWagerInfo!.side, lastWagerInfo!.amount);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Prediction Slip</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close Slip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
