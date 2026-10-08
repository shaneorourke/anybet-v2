import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Flame, 
  Trophy, 
  Coins, 
  Sparkles, 
  Smartphone,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { InAppNotification } from '../types';
import { sound } from '../utils/audio';

interface NotificationCenterProps {
  notifications: InAppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSimulateCommunityActivity: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onSimulateCommunityActivity,
}) => {
  if (!isOpen) return null;

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPushPermission = async () => {
    sound.playClick();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermission(res);
        if (res === 'granted') {
          new Notification('AnyBet Push Notifications Active', {
            body: 'You will receive real-time alerts on bet resolutions and community duels!',
            icon: '/favicon.ico',
          });
        }
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200 mt-12 sm:mt-0 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Push & Activity Notifications</h2>
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

        {/* Browser Push Permission Banner */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Web Push Notifications</span>
                <span className="text-[11px] text-slate-400">
                  {permission === 'granted'
                    ? 'Active · System push enabled'
                    : permission === 'denied'
                    ? 'Blocked by browser settings'
                    : 'Get alerted when duels settle'}
                </span>
              </div>
            </div>

            {permission !== 'granted' && (
              <button
                onClick={handleRequestPushPermission}
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                Enable
              </button>
            )}
            {permission === 'granted' && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Enabled</span>
              </span>
            )}
          </div>
        </div>

        {/* Simulation Sandbox Button */}
        <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs shrink-0">
          <span className="text-emerald-300 font-medium">Test Live Community Event:</span>
          <button
            onClick={() => {
              sound.playNotification();
              onSimulateCommunityActivity();
            }}
            className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 text-[11px] transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulate Incoming Bet</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                    !item.read
                      ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-200 mt-0.5 shrink-0">
                    {item.type === 'bet_won' ? (
                      <Trophy className="w-4 h-4 text-emerald-400" />
                    ) : item.type === 'community' ? (
                      <Flame className="w-4 h-4 text-amber-400" />
                    ) : item.type === 'bonus' ? (
                      <Coins className="w-4 h-4 text-amber-300" />
                    ) : (
                      <Bell className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{item.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onMarkAllAsRead();
            }}
            className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            Mark all read
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClearAll();
            }}
            className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear list</span>
          </button>
        </div>
      </div>
    </div>
  );
};
