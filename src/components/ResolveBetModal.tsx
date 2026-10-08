import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Coins, 
  Trophy,
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Bet } from '../types';
import { formatCoins } from '../utils/odds';
import { sound } from '../utils/audio';

interface ResolveBetModalProps {
  bet: Bet;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (betId: string, outcome: 'X' | 'Y' | 'refunded', notes: string) => void;
}

export const ResolveBetModal: React.FC<ResolveBetModalProps> = ({
  bet,
  isOpen,
  onClose,
  onResolve,
}) => {
  if (!isOpen) return null;

  const [selectedOutcome, setSelectedOutcome] = useState<'X' | 'Y' | 'refunded'>('X');
  const [notes, setNotes] = useState('');

  const winningPool = selectedOutcome === 'X' ? bet.sideX.pool : bet.sideY.pool;
  const losingPool = selectedOutcome === 'X' ? bet.sideY.pool : bet.sideX.pool;

  const handleConfirm = () => {
    sound.playWin();
    try {
      if (selectedOutcome !== 'refunded') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch {}

    onResolve(bet.id, selectedOutcome, notes || `Official resolution confirmed by creator.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
              Creator Settlement Portal
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Declare Official Showdown Outcome
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

        <div className="p-5 space-y-5">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block">Showdown:</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{bet.title}</h4>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span>Total Pot: <strong className="font-mono text-amber-300">{formatCoins(bet.totalPot)} $VS</strong></span>
              <span aria-hidden="true">·</span>
              <span>Participants: <strong>{bet.wagers.length} wagers</strong></span>
            </div>
          </div>

          {/* Outcome Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Verified Result:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedOutcome('X');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedOutcome === 'X'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                  <span>WINNER: SIDE X</span>
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-slate-100 truncate">
                  {bet.sideX.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Pays {bet.sideX.odds}x to backers
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedOutcome('Y');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedOutcome === 'Y'
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
                  <span>WINNER: SIDE Y</span>
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-slate-100 truncate">
                  {bet.sideY.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Pays {bet.sideY.odds}x to backers
                </div>
              </button>
            </div>

            {/* Cancel & Refund fallback option */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedOutcome('refunded');
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  selectedOutcome === 'refunded'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">
                    No Official Result / Cancel Duel (100% Full Refund to all)
                  </span>
                </div>
                {selectedOutcome === 'refunded' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          {/* Notes input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resolution Note or Score Summary (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. England won 2-1 in extra time with an 88th-minute header."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Audit Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Automated Ledger Settlement</span>
            </div>
            <p>
              {selectedOutcome === 'refunded'
                ? 'All wagers will be returned in full to each bettor’s balance immediately.'
                : `All users who backed Side ${selectedOutcome} will immediately receive their winnings. Losers' stakes are distributed proportionally.`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 transition-all ${
                selectedOutcome === 'refunded'
                  ? 'bg-amber-400 hover:bg-amber-300'
                  : 'bg-emerald-400 hover:bg-emerald-300'
              }`}
            >
              Confirm Settlement & Distribute Pot
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
