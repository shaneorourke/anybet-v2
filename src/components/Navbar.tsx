import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Coins, 
  Bell, 
  Plus, 
  Volume2, 
  VolumeX, 
  User, 
  Sparkles,
  History,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { UserProfile, InAppNotification } from '../types';
import { sound } from '../utils/audio';
import { formatCoins, getDailyBonusStatus } from '../utils/odds';

interface NavbarProps {
  user: UserProfile;
  currentView: 'arena' | 'my-wagers' | 'leaderboard' | 'history';
  onNavigate: (view: 'arena' | 'my-wagers' | 'leaderboard' | 'history') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onClaimDailyBonus: () => void;
  notifications: InAppNotification[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onOpenCreate,
  onOpenProfile,
  onOpenNotifications,
  onClaimDailyBonus,
  notifications,
  soundEnabled,
  onToggleSound,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const dailyStatus = getDailyBonusStatus(user.lastDailyBonus);

  const handleBonusClick = () => {
    sound.playClick();
    onClaimDailyBonus();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0E14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('arena');
            }}
            className="group flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 font-black text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              AB
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white group-hover:text-emerald-400 transition-colors">
                AnyBet
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Prediction Arena
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('arena');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'arena'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Open Duels</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('my-wagers');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'my-wagers'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>My Wagers & Created</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('leaderboard');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'leaderboard'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('history');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'history'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Past Showdowns</span>
          </button>
        </nav>

        {/* Zone 3: Wallet, Create CTA, Sound, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Duel CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCreate();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-sm shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Duel</span>
            <span className="sm:hidden">Duel</span>
          </button>

          {/* Fake Coins Wallet & Refill Button */}
          <div className="relative group">
            <button
              onClick={handleBonusClick}
              title={
                dailyStatus.canClaim
                  ? 'Click to claim your daily +250 $VS Coins drop!'
                  : `Daily drop already claimed today. Next 250 $VS drop in ${dailyStatus.timeRemainingText}.`
              }
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors ${
                dailyStatus.canClaim
                  ? 'bg-slate-900 border-amber-500/60 hover:border-amber-400'
                  : 'bg-slate-900/80 border-slate-700/80'
              }`}
            >
              <Coins className={`w-4 h-4 ${dailyStatus.canClaim ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Balance</div>
                <div className="font-mono text-xs font-bold text-amber-300 tracking-tight">
                  {formatCoins(user.balance)} <span className="text-[10px] text-slate-400">$VS</span>
                </div>
              </div>
              {dailyStatus.canClaim ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-400 hidden sm:block group-hover:scale-125 transition-transform" />
              ) : (
                <span className="text-[9px] font-mono text-slate-500 bg-slate-800/80 px-1 py-0.5 rounded hidden sm:inline-block">
                  {dailyStatus.timeRemainingText}
                </span>
              )}
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            title="Notifications & Community Updates"
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40"
            />
            <span className="hidden lg:block text-xs font-semibold text-slate-300">
              Lv.{user.level}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
