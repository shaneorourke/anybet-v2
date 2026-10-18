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
  TrendingUp,
  Trash2,
  AlertTriangle
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
  onOpenAuthModal?: () => void;
  onDeleteAccount?: (userId: string) => void;
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
  onOpenAuthModal,
  onDeleteAccount,
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

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
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1 pb-[max(20px,env(safe-area-inset-bottom,20px))]">
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

          {/* Account & Multi-User Switcher */}
          {onOpenAuthModal && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Multi-User Account Switcher</span>
                <span className="text-[11px] text-slate-400">
                  Logged in as <strong className="text-emerald-400">{user.name}</strong> (@{user.username}). Switch profile or register another player.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenAuthModal();
                }}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold whitespace-nowrap transition-colors"
              >
                👥 Switch / Create Account
              </button>
            </div>
          )}

          {/* Account Danger Zone: Delete Account */}
          {onDeleteAccount && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              {isConfirmingDelete ? (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Permanently delete account for {user.name}?</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    This will delete this user profile and remove your wallet coins ({formatCoins(user.balance)} $VS). You cannot undo this.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsConfirmingDelete(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onDeleteAccount(user.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Delete Account</span>
                    <span className="text-[11px] text-slate-500">
                      Permanently delete this account profile on this device.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsConfirmingDelete(true);
                    }}
                    className="py-1.5 px-3 rounded-lg border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
