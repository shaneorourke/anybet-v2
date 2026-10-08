import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  MessageCircle, 
  Twitter, 
  QrCode,
  Flame,
  Coins
} from 'lucide-react';
import { Bet } from '../types';
import { calculateOdds, formatCoins } from '../utils/odds';
import { sound } from '../utils/audio';

interface ShareModalProps {
  bet: Bet;
  userSide?: 'X' | 'Y';
  wagerAmount?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  bet,
  userSide = 'X',
  wagerAmount = 100,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const { oddsX, oddsY } = calculateOdds(bet.sideX.pool, bet.sideY.pool);
  const pickedSide = userSide === 'X' ? bet.sideX : bet.sideY;
  const pickedOdds = userSide === 'X' ? oddsX : oddsY;
  const potentialWin = Math.round(wagerAmount * pickedOdds);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://anybet.app';
  const shareText = `🔥 My prediction on AnyBet:\nI'm backing "${pickedSide.name}" @ ${pickedOdds}x in "${bet.title}"!\nPut your coins where your mouth is: ${shareUrl}`;

  const handleCopyLink = () => {
    sound.playClick();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator?.share) {
      try {
        await navigator.share({
          title: bet.title,
          text: `My prediction: ${pickedSide.name} @ ${pickedOdds}x in ${bet.title}`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleShareTwitter = () => {
    sound.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    sound.playClick();
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Share Prediction Slip</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Visual Bet Slip Preview Graphic */}
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white">AnyBet</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">OFFICIAL SLIP</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Head-to-Head Showdown
              </span>
              <p className="text-sm font-bold text-white leading-tight">
                {bet.title}
              </p>
            </div>

            <div className="my-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Backing to Win
                </span>
                <span className="font-bold text-sm text-slate-100">
                  {pickedSide.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Locked Odds</span>
                <span className="font-mono text-base font-extrabold text-emerald-400">
                  {pickedOdds}x
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Staked</span>
                <span className="font-bold text-slate-200">{formatCoins(wagerAmount)} $VS</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Projected Win</span>
                <span className="font-bold text-emerald-400">+{formatCoins(potentialWin)} $VS</span>
              </div>
            </div>
          </div>

          {/* Social Platforms Row */}
          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-2">
              Share directly to:
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleShareTwitter}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
              >
                <Twitter className="w-5 h-5 mb-1 text-[#1DA1F2]" />
                <span className="text-[10px] font-medium">X / Twitter</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
              >
                <MessageCircle className="w-5 h-5 mb-1 text-[#25D366]" />
                <span className="text-[10px] font-medium">WhatsApp</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
              >
                <Send className="w-5 h-5 mb-1 text-[#229ED9]" />
                <span className="text-[10px] font-medium">Telegram</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
              >
                <Share2 className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </div>
          </div>

          {/* Copy Link Input & Button */}
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
