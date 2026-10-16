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
import { getBroadcastPlatformInfo, getEventTiming } from '../utils/odds';

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
  const [selectedFocus, setSelectedFocus] = useState<string>('traitors');
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [accuracyMode, setAccuracyMode] = useState<'grounded' | 'creative'>('grounded');
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async (focusParam?: string, customKeyword?: string) => {
    setLoading(true);
    setError(null);
    sound.playClick();

    const currentFocus = focusParam !== undefined ? focusParam : selectedFocus;
    const currentKeywords = customKeyword !== undefined ? customKeyword : searchKeywords;

    try {
      const res = await fetch('/api/gemini/discover-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          focus: currentFocus,
          keywords: currentKeywords.trim(),
          mode: accuracyMode
        }),
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

  const handleQuickKeyword = (kw: string, focusVal: string) => {
    setSearchKeywords(kw);
    setSelectedFocus(focusVal);
    fetchMatches(focusVal, kw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 block">
                Powered by Google Gemini Live Search Oracle
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Spotlight Traitors Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 tracking-wider">
                    Airing Now • BBC One & iPlayer
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Series 2 (2026 Season)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Celebrity Traitors UK 2026: Live Episode Wagers & Oracle Settlement
                </h3>
                <p className="text-xs text-slate-300 leading-snug">
                  Ep 3: Richard E. Grant banished! Ep 4: Turret murder & Round Table tonight. Search or generate duels with instant live oracle verification.
                </p>
              </div>

              <button
                onClick={() => handleQuickKeyword('Celebrity Traitors UK 2026 Episode 4', 'traitors')}
                disabled={loading}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan 2026 Traitors Bets</span>
              </button>
            </div>
          </div>

          {/* USER KEYWORD SEARCH INPUT BAR (Makes Gemini Suggestions Hyper-Relevant) */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guide Gemini with Custom Keywords or Specific Matchups</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAccuracyMode('grounded')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    accuracyMode === 'grounded' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Strict Grounded Real-World Accuracy"
                >
                  🎯 Grounded
                </button>
                <button
                  type="button"
                  onClick={() => setAccuracyMode('creative')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    accuracyMode === 'creative' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Creative Prop Bets"
                >
                  🌶️ Spicy Props
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchMatches();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. Celebrity Traitors, Arsenal vs Chelsea, UFC 305, CS2 BLAST..."
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                {searchKeywords && (
                  <button
                    type="button"
                    onClick={() => setSearchKeywords('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Searching...' : 'Scan Gemini'}</span>
              </button>
            </form>

            {/* Quick Keyword Suggestion Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-slate-500 text-[10px] font-semibold shrink-0">Popular:</span>
              {[
                { label: '🏰 Traitors 2026', kw: 'Celebrity Traitors UK 2026 Round Table & Turret', focus: 'traitors' },
                { label: '⚽ Champions League', kw: 'Champions League Arsenal Real Madrid Bayern', focus: 'football' },
                { label: '🥊 UFC / MMA', kw: 'UFC Championship Main Event Title Fight', focus: 'sports' },
                { label: '🔫 CS2 BLAST', kw: 'CS2 BLAST Premier FaZe NaVi G2 Esports', focus: 'cs2' },
                { label: '📺 Great British Bake Off', kw: 'Great British Bake Off Star Baker Showdown', focus: 'tv' },
                { label: '🏎️ Formula 1', kw: 'Formula 1 Grand Prix Podium Clash', focus: 'sports' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickKeyword(chip.kw, chip.focus)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 whitespace-nowrap transition-colors shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'traitors', label: '🏰 Traitors 2026' },
              { id: 'football', label: '⚽ Football' },
              { id: 'cs2', label: '🔫 CS2 Esports' },
              { id: 'fighting', label: '🥊 Fighting / Boxing' },
              { id: 'tv', label: '📺 TV & Pop Culture' },
              { id: 'all', label: '🔥 All Marquee' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedFocus(tab.id);
                  fetchMatches(tab.id);
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
                const stream = getBroadcastPlatformInfo(
                  item.streamUrl || item.twitchUrl,
                  item.broadcastPlatform || item.streamPlatform,
                  item.eventLeague || item.title
                );
                const timing = getEventTiming(item.scheduledStart, item.scheduledEnd);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-semibold mb-1">
                          <span className="uppercase text-sky-400 font-bold">{item.eventLeague || item.category}</span>
                          <span aria-hidden="true">·</span>
                          
                          {timing.isLive ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              LIVE NOW
                            </span>
                          ) : item.isConcluded || item.hoursUntil === 0 ? (
                            <span className="text-emerald-400 font-bold">
                              🏆 Aired · Ready to Verify
                            </span>
                          ) : (
                            <span className="text-slate-300">
                              Starts: <strong className="text-slate-100">{timing.startFormatted}</strong> ({timing.startCountdown})
                            </span>
                          )}

                          {stream && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${stream.badgeBg} ${stream.badgeText}`}>
                                <Tv className="w-3 h-3" /> {stream.shortName}
                              </span>
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

                    {item.accuracyRationale && (
                      <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-300 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span><strong>Gemini Live Grounding:</strong> {item.accuracyRationale}</span>
                      </div>
                    )}
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
