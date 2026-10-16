import React from 'react';
import { LayoutGrid, Flame, Trophy, Plus, User } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileBottomNavProps {
  currentView: 'arena' | 'my-wagers' | 'leaderboard' | 'history';
  onNavigate: (view: 'arena' | 'my-wagers' | 'leaderboard' | 'history') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  activeWagersCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCreate,
  onOpenProfile,
  activeWagersCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0B0E14]/95 backdrop-blur-xl border-t border-slate-800/90 px-3 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom,10px))] shadow-2xl">
      <div className="grid grid-cols-5 items-center h-12 max-w-md mx-auto">
        {/* Arena */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('arena');
          }}
          className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-95 ${
            currentView === 'arena' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Arena Duels"
        >
          <div className={`p-1 rounded-xl transition-colors ${currentView === 'arena' ? 'bg-emerald-500/15' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Arena</span>
        </button>

        {/* My Wagers */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('my-wagers');
          }}
          className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-95 ${
            currentView === 'my-wagers' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="My Wagers"
        >
          <div className={`relative p-1 rounded-xl transition-colors ${currentView === 'my-wagers' ? 'bg-emerald-500/15' : ''}`}>
            <Flame className={`w-5 h-5 ${currentView === 'my-wagers' ? 'text-amber-400' : ''}`} />
            {activeWagersCount > 0 && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0B0E14]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Wagers</span>
        </button>

        {/* Create Center Hero Floating Action */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCreate();
          }}
          className="relative flex flex-col items-center justify-center min-h-[44px] -mt-5 group"
          aria-label="Create New Duel"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-[#0B0E14] group-active:scale-90 transition-transform">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">Duel</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('leaderboard');
          }}
          className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-95 ${
            currentView === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Leaderboard Rankings"
        >
          <div className={`p-1 rounded-xl transition-colors ${currentView === 'leaderboard' ? 'bg-emerald-500/15' : ''}`}>
            <Trophy className={`w-5 h-5 ${currentView === 'leaderboard' ? 'text-yellow-400' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Ranks</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="relative flex flex-col items-center justify-center min-h-[44px] py-1 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
          aria-label="User Profile"
        >
          <div className="p-1 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
