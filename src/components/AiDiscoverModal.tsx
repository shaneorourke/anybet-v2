import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  Tv, 
  Plus, 
  Check, 
  RefreshCw, 
  Calendar, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Bet } from '../types';
import { sound } from '../utils/audio';

interface AiDiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMatch: (match: any) => void;
}

export const AiDiscoverModal: React.FC<AiDiscoverModalProps> = ({
  isOpen,
  onClose,
  onAddMatch,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [discovered, setDiscovered] = useState<any[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async (focus = 'all') => {
    setLoading(true);
    setError(null);
    sound.playClick();

    try {
      const res = await fetch('/api/gemini/discover-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setDiscovered(data.matches);
        sound.playWin();
      } else {
        setError(data.error || 'Could not fetch real-world matches');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching matches');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item: any, idx: number) => {
    sound.playClick();
    onAddMatch(item);
    setAddedIds((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 block">
                Powered by Google Gemini & Search
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Discover Live Real-World Showdowns
              </h2>
            </div>
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Spotlight Traitors Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 tracking-wider">
                    Airing Now • BBC One & iPlayer
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Celebrity Traitors UK 2026
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  UK Celebrity Traitors 2026: Tonight's Murder & Banishment Wagers
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  Featuring the 2026 celebrity cast (Joe Lycett, Romesh Ranganathan, Michael Sheen, Bella Ramsey, James Acaster, Maya Jama, Richard E. Grant & more). Predict who gets murdered in the turret or banished at Claudia's Round Table tonight!
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedFocus('traitors');
                  fetchMatches('traitors');
                }}
                disabled={loading}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan 2026 Traitors Bets</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Gemini searches live TV schedules, sporting leagues, CS2 tournaments, and fighting championships to auto-generate authentic head-to-head prediction duels with official stream and broadcast links.
          </p>

          {/* Generator Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'traitors', label: '🏰 Traitors 2026' },
                { id: 'tv', label: '📺 TV & Pop Culture' },
                { id: 'all', label: '🔥 All Marquee' },
                { id: 'football', label: '⚽ Champions League' },
                { id: 'cs2', label: '🔫 CS2 Esports' },
                { id: 'fighting', label: '🥊 Street Fighter' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedFocus(tab.id);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedFocus === tab.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchMatches(selectedFocus)}
              disabled={loading}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Searching...' : 'Scan & Generate'}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Results List */}
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <div className="text-xs text-slate-300 font-medium">
                Gemini is querying real-world broadcasts, tournament brackets & television fixtures...
              </div>
            </div>
          ) : discovered.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Discovered Real-World Matches ({discovered.length})</span>
                <span>Click (+) to Add to Arena</span>
              </div>

              {discovered.map((item, idx) => {
                const isAdded = !!addedIds[idx];
                const isBBC = item.twitchUrl?.toLowerCase().includes('bbc') || item.twitchUrl?.toLowerCase().includes('iplayer') || item.eventLeague?.toLowerCase().includes('bbc');
                const isTwitch = item.twitchUrl?.toLowerCase().includes('twitch');

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mb-1">
                          <span className="uppercase text-sky-400 font-bold">{item.eventLeague || item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className={item.daysUntil === 0 ? "text-amber-400 font-bold" : ""}>
                            {item.daysUntil === 0 ? '🔥 On Tonight!' : `In ${item.daysUntil} days`}
                          </span>
                          {item.twitchUrl && (
                            <>
                              <span aria-hidden="true">·</span>
                              {isBBC ? (
                                <span className="flex items-center gap-1 text-red-400 font-bold">
                                  <Tv className="w-3 h-3" /> BBC iPlayer
                                </span>
                              ) : isTwitch ? (
                                <span className="flex items-center gap-1 text-[#9146FF] font-bold">
                                  <Tv className="w-3 h-3" /> Twitch
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-sky-400 font-bold">
                                  <Tv className="w-3 h-3" /> Broadcast
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      </div>

                      <button
                        onClick={() => handleAdd(item, idx)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Duel</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[10px] text-emerald-400 font-bold block">SIDE X</span>
                        <span className="font-bold text-slate-200">
                          {item.sideXFlag && `${item.sideXFlag} `}{item.sideXName}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[10px] text-rose-400 font-bold block">SIDE Y</span>
                        <span className="font-bold text-slate-200">
                          {item.sideYFlag && `${item.sideYFlag} `}{item.sideYName}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      <strong>Rules:</strong> {item.rules}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <Bot className="w-8 h-8 text-sky-400 mx-auto opacity-70" />
              <p className="text-xs text-slate-300 font-medium">
                Ready to find real-world TV wagers and tournament showdowns.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedFocus('traitors');
                    fetchMatches('traitors');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Celebrity Traitors Duels</span>
                </button>
                <button
                  onClick={() => fetchMatches('all')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Scan All Showdowns
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
