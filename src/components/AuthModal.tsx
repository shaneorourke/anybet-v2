import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Sparkles, 
  Check, 
  Coins, 
  ShieldCheck, 
  ArrowRight,
  Shuffle,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import { formatCoins } from '../utils/odds';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onCreateAccount: (name: string, username: string, avatar: string) => void;
  onSwitchAccount: (userId: string) => void;
  canDismiss?: boolean;
}

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVS&backgroundColor=0284c7',
  'https://api.dicebear.com/7.x/bottts/svg?seed=MayaForecaster&backgroundColor=7c3aed',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LiamTrader&backgroundColor=059669',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaProphet&backgroundColor=dc2626',
  'https://api.dicebear.com/7.x/bottts/svg?seed=JordanSharp&backgroundColor=d97706',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ZeusOracle&backgroundColor=0369a1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberKnight&backgroundColor=be123c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ShaneVS&backgroundColor=0f172a',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  currentUser,
  onCreateAccount,
  onSwitchAccount,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'switch'>('create');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [avatarSeed, setAvatarSeed] = useState(Date.now().toString());

  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(clean ? `@${clean}` : '');
    }
  };

  const handleRandomizeAvatar = () => {
    sound.playClick();
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${newSeed}&backgroundColor=0f172a`;
    setSelectedAvatar(newAvatar);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playWin();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const cleanUsername = username.replace(/^@/, '').trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '');
    onCreateAccount(name.trim(), cleanUsername, selectedAvatar);
    onClose();
  };

  const handleSelectAccount = (userItem: UserProfile) => {
    sound.playClick();
    onSwitchAccount(userItem.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
                AnyBet Identity Hub
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {activeTab === 'create' ? 'Create Predictor Account' : 'Switch Predictor Account'}
              </h2>
            </div>
          </div>

          {canDismiss && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('create');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('switch');
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch Profile ({allUsers.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 pb-[max(20px,env(safe-area-inset-bottom,20px))]">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              {/* Free Welcome Bonus Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div className="text-xs">
                  <strong className="text-emerald-300 font-bold block">
                    Welcome Gift: +1,000 $VS Free Coins
                  </strong>
                  <span className="text-slate-300">
                    Get your own predictor wallet, stake on duels, and climb the public leaderboard!
                  </span>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / Display Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Miller"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Username Handle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Predictor Username Handle
                </label>
                <input
                  type="text"
                  placeholder="@alex_bets"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Choose Your Avatar
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Randomize</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_AVATARS.map((av, idx) => {
                    const isSelected = selectedAvatar === av;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedAvatar(av);
                        }}
                        className={`relative rounded-xl p-1 bg-slate-950 border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/10 scale-105 shadow-md shadow-emerald-500/10'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={av}
                          alt="Avatar option"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Account & Start With 1,000 $VS</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Choose an account to switch profiles on this device:
              </div>

              <div className="space-y-2">
                {allUsers.map((userItem) => {
                  const isCurrent = userItem.id === currentUser.id;
                  return (
                    <div
                      key={userItem.id}
                      onClick={() => handleSelectAccount(userItem)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={userItem.avatar}
                          alt={userItem.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate">
                              {userItem.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono block truncate">
                            @{userItem.username} · Lv.{userItem.level}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold font-mono text-amber-300">
                          {formatCoins(userItem.balance)} $VS
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {userItem.betsWon}W - {userItem.betsLost}L
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('create');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register Another New Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
