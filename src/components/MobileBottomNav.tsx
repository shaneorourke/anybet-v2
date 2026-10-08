import React from 'react';
import { LayoutGrid, Flame, Trophy, PlusCircle, User } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileBottomNavProps {
  currentView: 'arena' | 'my-wagers' | 'leaderboard' | 'history';
  onNavigate: (view: 'arena' | 'my-wagers' | 'leaderboard' | 'history') => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCreate,
  onOpenProfile,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0B0E14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-area-bottom">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Arena */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('arena');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'arena' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Arena</span>
        </button>

        {/* My Wagers */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('my-wagers');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'my-wagers' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">My Wagers</span>
        </button>

        {/* Create Center Hero Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCreate();
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] -mt-3"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400 mt-0.5">Duel</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('leaderboard');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentView === 'leaderboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Ranks</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
