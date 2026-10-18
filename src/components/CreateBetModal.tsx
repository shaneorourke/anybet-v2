import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Coins,
  Tv,
  Radio,
  ExternalLink,
  Dices,
  RotateCcw,
  Shuffle
} from 'lucide-react';
import { Category, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { formatCoins } from '../utils/odds';

interface CreateBetModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onCreateBet: (newBetData: {
    title: string;
    category: Category;
    sideXName: string;
    sideYName: string;
    rules: string;
    startDate?: string;
    endDate: string;
    seedAmount: number;
    bannerImage?: string;
    streamUrl?: string;
    streamPlatform?: string;
  }) => void;
}

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'culinary', label: 'Cooking & Food', icon: '🍳' },
  { id: 'tech', label: 'Tech & Business', icon: '💻' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮' },
  { id: 'culture', label: 'Culture & Daily', icon: '🌍' },
];

const PRESETS = [
  { 
    sideX: 'Richard E. Grant (Banished)', 
    sideY: 'James Acaster (Survives)', 
    title: 'Celebrity Traitors UK 2026 (Ep 3): Round Table Traitor Banishment — Richard E. Grant vs James Acaster', 
    cat: 'entertainment' as Category,
    hours: 1, // Concluded episode / ready to verify
    rules: 'Official BBC One broadcast reveal: First Traitor exposed & banished at Claudia Winkleman\'s Round Table in Episode 3.'
  },
  { 
    sideX: 'Michael Sheen (Murdered in Turret)', 
    sideY: 'Bella Ramsey (Survives)', 
    title: 'Celebrity Traitors UK 2026 (Ep 4 Tonight): Who will the Traitors Murder in the Turret?', 
    cat: 'entertainment' as Category,
    hours: 10, // Tonight at 21:00 BST BBC One
    rules: 'Official BBC One broadcast tonight: Contestant murdered by Traitors Maya Jama & James Acaster before breakfast.'
  },
  { 
    sideX: 'Joe Lycett (Banished)', 
    sideY: 'Romesh Ranganathan (Survives)', 
    title: 'Celebrity Traitors UK 2026 (Ep 4 Tonight): Who is Banished at the Round Table Tonight?', 
    cat: 'entertainment' as Category,
    hours: 10, // Tonight at 21:00 BST BBC One
    rules: 'Official BBC One Episode 4 broadcast tonight: Celebrity receiving the most banishment votes at the Round Table.'
  },
  { 
    sideX: 'Jim (Woodfire Smoker)', 
    sideY: 'John (Pastry & Flambé)', 
    title: 'Cooking Showdown: Jim vs John Culinary Duel', 
    cat: 'culinary' as Category,
    hours: 24,
    rules: 'First party to achieve verified outcome takes the decision.'
  },
  { 
    sideX: 'England', 
    sideY: 'Spain', 
    title: 'England vs Spain Football Showdown', 
    cat: 'sports' as Category,
    hours: 48,
    rules: 'Official 90-minute regular play whistle result.'
  },
  { 
    sideX: 'Tesla', 
    sideY: 'BYD', 
    title: 'Tesla vs BYD Global EV Deliveries Race', 
    cat: 'tech' as Category,
    hours: 72,
    rules: 'Quarterly official investor relation deliveries report.'
  },
];

interface GeneratedDraft {
  title: string;
  sideXName: string;
  sideYName: string;
  category: Category;
  rules: string;
  startHours: number;
  deadlineHours: number;
  streamPlatform: string;
  streamUrl: string;
  rationale?: string;
}

export const CreateBetModal: React.FC<CreateBetModalProps> = ({
  user,
  isOpen,
  onClose,
  onCreateBet,
}) => {
  if (!isOpen) return null;

  const [sideXName, setSideXName] = useState('');
  const [sideYName, setSideYName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('sports');
  const [rules, setRules] = useState('');
  const [startHours, setStartHours] = useState<number>(8); // Event kickoff time relative to now
  const [deadlineHours, setDeadlineHours] = useState<number>(10);
  const [streamPlatform, setStreamPlatform] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [seedAmount, setSeedAmount] = useState<number>(50);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<GeneratedDraft[]>([]);
  const [currentDraftIdx, setCurrentDraftIdx] = useState<number>(-1);

  const loadDraft = (draft: GeneratedDraft, idx: number) => {
    sound.playClick();
    setSideXName(draft.sideXName);
    setSideYName(draft.sideYName);
    setTitle(draft.title);
    setCategory(draft.category);
    setRules(draft.rules);
    setStartHours(draft.startHours);
    setDeadlineHours(draft.deadlineHours);
    setStreamPlatform(draft.streamPlatform || '');
    setStreamUrl(draft.streamUrl || '');
    setCurrentDraftIdx(idx);
    setAiSuccessMessage(draft.rationale || `Angle #${idx + 1} loaded`);
  };

  // AI Co-Pilot: Generate or re-roll full duel from user keywords or concept prompt
  const handleGenerateDuelWithAi = async (e?: React.FormEvent, forceReroll: boolean = false) => {
    if (e) e.preventDefault();
    const promptText = aiPrompt.trim() || title.trim() || 'Celebrity Traitors UK 2026';
    if (!promptText) return;

    setIsGeneratingAi(true);
    sound.playClick();

    // If user clicks Auto-Draft but drafts already exist, or explicitly clicks Re-Roll, treat as next angle
    const isNextRoll = forceReroll || drafts.length > 0;
    const nextCount = isNextRoll ? drafts.length : 0;
    const avoidTitles = Array.from(
      new Set([...drafts.map((d) => d.title), title].filter(Boolean))
    );
    const avoidSides = Array.from(
      new Set([...drafts.flatMap((d) => [d.sideXName, d.sideYName]), sideXName, sideYName].filter(Boolean))
    );

    try {
      const res = await fetch('/api/gemini/generate-duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          category,
          avoidTitles,
          avoidSides,
          rerollCount: nextCount,
          seed: Date.now().toString(),
        }),
      });
      const data = await res.json();
      if (data.success && data.duel) {
        const newDraft: GeneratedDraft = {
          title: data.duel.title || `${data.duel.sideXName} vs ${data.duel.sideYName}`,
          sideXName: data.duel.sideXName || 'Competitor X',
          sideYName: data.duel.sideYName || 'Competitor Y',
          category: (data.duel.category as Category) || category,
          rules: data.duel.rules || 'Official match referee whistle or broadcast confirmation.',
          startHours: data.duel.startHoursFromNow !== undefined ? data.duel.startHoursFromNow : 8,
          deadlineHours: data.duel.deadlineHours || 10,
          streamPlatform: data.duel.broadcastPlatform || '',
          streamUrl: data.duel.streamUrl || '',
          rationale: data.duel.rationale || `New distinct angle #${nextCount + 1}`,
        };

        const updatedDrafts = [...drafts, newDraft];
        setDrafts(updatedDrafts);
        setSideXName(newDraft.sideXName);
        setSideYName(newDraft.sideYName);
        setTitle(newDraft.title);
        setCategory(newDraft.category);
        setRules(newDraft.rules);
        setStartHours(newDraft.startHours);
        setDeadlineHours(newDraft.deadlineHours);
        setStreamPlatform(newDraft.streamPlatform);
        setStreamUrl(newDraft.streamUrl);
        setCurrentDraftIdx(updatedDrafts.length - 1);
        setAiSuccessMessage(
          updatedDrafts.length > 1
            ? `🎲 Re-rolled Angle #${updatedDrafts.length}: ${newDraft.rationale || 'Fresh alternative matchup generated!'}`
            : (newDraft.rationale || 'Duel populated with verified real-world context & broadcast!')
        );
        sound.playWin();
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Update title automatically if user hasn't typed custom title
  const handleSideXChange = (val: string) => {
    setSideXName(val);
    if (!title || title.includes('vs')) {
      setTitle(`${val} vs ${sideYName || 'Side Y'}`);
    }
  };

  const handleSideYChange = (val: string) => {
    setSideYName(val);
    if (!title || title.includes('vs')) {
      setTitle(`${sideXName || 'Side X'} vs ${val}`);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    sound.playClick();
    setSideXName(preset.sideX);
    setSideYName(preset.sideY);
    setTitle(preset.title);
    setCategory(preset.cat);
    setDeadlineHours(preset.hours);
    setStartHours(Math.max(0, preset.hours - 2));
    setRules(preset.rules);
    if (preset.cat === 'entertainment') {
      setStreamPlatform('BBC iPlayer & BBC One');
      setStreamUrl('https://www.bbc.co.uk/iplayer');
    } else if (preset.cat === 'sports') {
      setStreamPlatform('Sky Sports & Live TV');
      setStreamUrl('https://www.skysports.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideXName.trim() || !sideYName.trim() || !title.trim()) return;

    sound.playBetPlaced();

    const startDate = new Date(Date.now() + startHours * 60 * 60 * 1000).toISOString();
    const endDate = new Date(Date.now() + Math.max(startHours + 1, deadlineHours) * 60 * 60 * 1000).toISOString();

    onCreateBet({
      title: title.trim(),
      category,
      sideXName: sideXName.trim(),
      sideYName: sideYName.trim(),
      rules: rules.trim() || `The participant who wins the official contest takes the decision. Creator confirms result before ${new Date(endDate).toLocaleString()}.`,
      startDate,
      endDate,
      seedAmount: Math.min(seedAmount, user.balance),
      streamPlatform: streamPlatform.trim() || undefined,
      streamUrl: streamUrl.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              Create Head-to-Head Duel
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Strictly X vs Y Prediction Market
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close duel creator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1 pb-[max(20px,env(safe-area-inset-bottom,20px))]">
          {/* AI Co-Pilot: Auto-Draft & Re-Roll */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Co-Pilot: Instant Auto-Draft & Re-Roll</span>
              </span>
              {drafts.length > 0 && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentDraftIdx + 1} of {drafts.length} angle{drafts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Keywords (e.g. Traitors Ep 4, UFC Edwards vs Covington, Tesla vs BYD)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateDuelWithAi(undefined, drafts.length > 0);
                  }
                }}
                className="flex-1 h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleGenerateDuelWithAi(undefined, drafts.length > 0)}
                  disabled={isGeneratingAi || (!aiPrompt.trim() && !title.trim())}
                  className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm shadow-sky-500/20"
                  title="Generate or re-roll a head-to-head duel from your keywords"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Drafting...' : drafts.length > 0 ? 'Generate Next' : 'Auto-Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateDuelWithAi(undefined, true)}
                  disabled={isGeneratingAi || (!aiPrompt.trim() && !title.trim())}
                  className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  title="Generate a completely different matchup or outcome for these keywords"
                >
                  <Dices className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>Re-Roll Angle</span>
                </button>
              </div>
            </div>

            {/* Angle Navigator: Cycle back and forth between previous rolls */}
            {drafts.length > 1 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentDraftIdx <= 0}
                    onClick={() => loadDraft(drafts[currentDraftIdx - 1], currentDraftIdx - 1)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors"
                  >
                    ← Prev Angle
                  </button>
                  <span className="font-semibold text-slate-300 text-xs">
                    Angle {currentDraftIdx + 1} of {drafts.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentDraftIdx >= drafts.length - 1}
                    onClick={() => loadDraft(drafts[currentDraftIdx + 1], currentDraftIdx + 1)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors"
                  >
                    Next Angle →
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateDuelWithAi(undefined, true)}
                  disabled={isGeneratingAi}
                  className="text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Dices className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>Re-Roll Fresh</span>
                </button>
              </div>
            )}

            {aiSuccessMessage && (
              <div className="flex items-center justify-between gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                <span className="truncate">✓ {aiSuccessMessage}</span>
                <button
                  type="button"
                  onClick={() => handleGenerateDuelWithAi(undefined, true)}
                  disabled={isGeneratingAi}
                  className="text-emerald-400 hover:text-white font-bold underline shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <Dices className="w-3 h-3" />
                  <span>Re-roll another</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Idea Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Quick Inspiration Templates</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white whitespace-nowrap transition-colors"
                >
                  {p.sideX.split(' ')[0]} vs {p.sideY.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory X vs Y Fields */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block mb-3">
              1. Define The Two Competitors (X vs Y)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Competitor X <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. England or Chef Jim"
                  value={sideXName}
                  onChange={(e) => handleSideXChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-900 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Competitor Y <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spain or Chef John"
                  value={sideYName}
                  onChange={(e) => handleSideYChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-900 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Duel Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duel Headline / Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jim vs John in the Grand 3-Course Cooking Final"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Showdown Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setCategory(cat.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    category === cat.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base mb-0.5">{cat.icon}</span>
                  <span className="text-[10px] leading-tight truncate w-full">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Kickoff & Start Time (Tune-in window) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Event Kickoff / Tune-In Time</span>
              </label>
              <span className="text-[11px] font-semibold text-sky-300">
                {startHours === 0 
                  ? '🔴 Starting Now / Live' 
                  : startHours <= 12 
                  ? `Tonight in ~${startHours}h (${new Date(Date.now() + startHours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                  : `Starts: ${new Date(Date.now() + startHours * 3600000).toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${new Date(Date.now() + startHours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              {[
                { hours: 0, label: '🔴 Live Now' },
                { hours: 2, label: '⏱️ In 2h' },
                { hours: 8, label: '🌙 Tonight' },
                { hours: 24, label: '☀️ Tomorrow' },
                { hours: 48, label: '📅 In 2 Days' },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStartHours(opt.hours);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all truncate text-center ${
                    startHours === opt.hours
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Platform & Tune-In Stream Link */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-rose-400" />
                <span>Broadcaster & Tune-In Channel</span>
              </label>
              <span className="text-[10px] text-slate-500">
                (Avoids falsely labeling as Twitch)
              </span>
            </div>

            {/* Quick Broadcaster Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { name: 'BBC iPlayer & BBC One', url: 'https://www.bbc.co.uk/iplayer', label: '🏰 BBC iPlayer' },
                { name: 'Sky Sports & Peacock', url: 'https://www.skysports.com', label: '⚽ Sky Sports' },
                { name: 'TNT Sports & ESPN+', url: 'https://www.tntsports.co.uk', label: '🥊 TNT Sports' },
                { name: 'Twitch', url: 'https://twitch.tv', label: '🟣 Twitch' },
                { name: 'YouTube Live', url: 'https://youtube.com', label: '▶️ YouTube' },
                { name: 'TV Broadcast', url: 'https://www.google.com', label: '📺 Live TV' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStreamPlatform(preset.name);
                    setStreamUrl(preset.url);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 ${
                    streamPlatform === preset.name
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Platform name (e.g. BBC iPlayer, Sky Sports)"
                value={streamPlatform}
                onChange={(e) => setStreamPlatform(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="url"
                placeholder="Broadcast / Stream URL (https://...)"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* End Date & Resolution Deadline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Resolution Deadline
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {deadlineHours <= 12 ? `Tonight in ${deadlineHours}h` : `Ends: ${new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toLocaleString()}`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { hours: 10, label: 'Tonight (~10h)' },
                { hours: 24, label: '24 Hours' },
                { hours: 72, label: '3 Days' },
                { hours: 168, label: '1 Week' },
              ].map((d) => (
                <button
                  key={d.hours}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDeadlineHours(d.hours);
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    deadlineHours === d.hours
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Verification Rulebook */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Resolution Criteria & Rules
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Winner decided by official referee whistle / critic vote count."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Seed Pot (Fake Coins) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Initial Creator Liquidity Seed ($VS)
              </label>
              <span className="text-xs text-slate-400">
                Balance: {formatCoins(user.balance)} $VS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={user.balance}
                value={seedAmount}
                onChange={(e) => setSeedAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400">
                Seeding coins creates initial parity (split 50/50 between X and Y).
              </span>
            </div>
          </div>

          {/* Creator Contract Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-start text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-300">Creator Commitment Guarantee:</strong>
              As creator, you must log in and confirm the winner once the deadline arrives. If the outcome is not resolved within the grace window, all wagers are automatically cancelled and 100% refunded.
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!sideXName.trim() || !sideYName.trim() || !title.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              Publish Head-to-Head Duel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
