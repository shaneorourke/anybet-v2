import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Trophy, 
  Flame, 
  Award, 
  Sparkles, 
  Check, 
  Edit3, 
  RefreshCw,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { formatCoins, getDailyBonusStatus } from '../utils/odds';
import { sound } from '../utils/audio';

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onClaimDailyBonus: () => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShaneVS&backgroundColor=0f172a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ZeusOracle&backgroundColor=0369a1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ApexForecaster&backgroundColor=047857',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaR&backgroundColor=7c3aed',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnight&backgroundColor=be123c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Solaris&backgroundColor=ca8a04',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onClaimDailyBonus,
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);

  const totalBets = user.betsWon + user.betsLost;
  const winRate = totalBets > 0 ? Math.round((user.betsWon / totalBets) * 100) : 0;
  const xpNeeded = user.level * 500;
  const xpPercent = Math.min(100, Math.round((user.xp / xpNeeded) * 100));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateUser({
      name: name.trim() || user.name,
      username: username.trim() || user.username,
      avatar: selectedAvatar,
    });
    setIsEditing(false);
  };

  const dailyStatus = getDailyBonusStatus(user.lastDailyBonus);

  const handleClaim = () => {
    if (!dailyStatus.canClaim) {
      sound.playClick();
      return;
    }
    sound.playWin();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    onClaimDailyBonus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Gamified Predictor Profile
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Identity & Reputation
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* User Hero Identity */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={isEditing ? selectedAvatar : user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10"
              />
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                Lv.{user.level}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-extrabold text-base text-white truncate">{user.name}</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400 block font-mono">@{user.username}</span>

              {/* XP Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Level {user.level} Forecaster</span>
                  <span className="font-mono">{user.xp} / {xpNeeded} XP</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form if toggled */}
          {isEditing && (
            <form onSubmit={handleSave} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                Edit Profile Customization
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username Handle</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedAvatar === av ? 'border-emerald-400 scale-105' : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={av} alt="Avatar option" referrerPolicy="no-referrer" className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Gamified Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
              <span className="font-mono text-sm font-bold text-amber-300 mt-1 block">
                {formatCoins(user.balance)} $VS
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Rate</span>
              <span className="font-mono text-sm font-bold text-emerald-400 mt-1 block">
                {winRate}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Streak</span>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-amber-400 mt-1">
                <Flame className="w-4 h-4" />
                <span>{user.winStreak}W</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Record</span>
              <span className="font-mono text-xs text-slate-200 mt-1 block">
                {user.betsWon}W · {user.betsLost}L
              </span>
            </div>
          </div>

          {/* Daily Faucet Refill Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>24-Hour Daily Coin Drop</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {dailyStatus.canClaim 
                  ? 'Your daily +250 $VS Coins faucet bonus is ready to claim!'
                  : `Already claimed today! Next 250 $VS drop available in ${dailyStatus.timeRemainingText}.`}
              </p>
            </div>

            <button
              onClick={handleClaim}
              disabled={!dailyStatus.canClaim}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto ${
                dailyStatus.canClaim
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {dailyStatus.canClaim ? 'Claim +250 $VS Coins' : `Cooldown: ${dailyStatus.timeRemainingText}`}
            </button>
          </div>

          {/* Badges & Achievements Showcase */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Unlocked Badges & Medals ({user.badges.length}/6)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {user.badges.map((b) => (
                <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center gap-2.5">
                  <span className="text-2xl">{b.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">{b.title}</span>
                    <span className="text-[10px] text-slate-400 block leading-tight truncate">{b.description}</span>
                  </div>
                </div>
              ))}

              {/* Locked Badges */}
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40 flex items-center gap-2.5 opacity-50">
                <span className="text-2xl">👑</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-400 block">Grand Oracle</span>
                  <span className="text-[10px] text-slate-500 block">Reach #1 on Leaderboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
