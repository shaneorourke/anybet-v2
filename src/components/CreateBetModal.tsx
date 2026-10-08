import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Coins
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
    endDate: string;
    seedAmount: number;
    bannerImage?: string;
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
  { sideX: 'Joe Lycett (Banished)', sideY: 'Romesh Ranganathan (Survives)', title: 'Celebrity Traitors UK 2026: Who is Banished at the Round Table Tonight?', cat: 'entertainment' as Category },
  { sideX: 'Michael Sheen (Murdered in Turret)', sideY: 'Bella Ramsey (Survives)', title: 'Celebrity Traitors UK 2026: Who is Murdered Overnight by the Traitors?', cat: 'entertainment' as Category },
  { sideX: 'Jim (Woodfire Smoker)', sideY: 'John (Pastry & Flambé)', title: 'Cooking Showdown: Jim vs John Culinary Duel', cat: 'culinary' as Category },
  { sideX: 'England', sideY: 'Spain', title: 'England vs Spain Football Showdown', cat: 'sports' as Category },
  { sideX: 'Tesla', sideY: 'BYD', title: 'Tesla vs BYD Global EV Deliveries Race', cat: 'tech' as Category },
  { sideX: 'Marvel Studios', sideY: 'DC Studios', title: 'Marvel vs DC Box Office Battle', cat: 'entertainment' as Category },
];

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
  const [deadlineDays, setDeadlineDays] = useState<number>(3);
  const [seedAmount, setSeedAmount] = useState<number>(50);

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
    setRules(`First party to achieve verified outcome takes the decision. Creator confirms result.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideXName.trim() || !sideYName.trim() || !title.trim()) return;

    sound.playBetPlaced();

    const endDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();

    onCreateBet({
      title: title.trim(),
      category,
      sideXName: sideXName.trim(),
      sideYName: sideYName.trim(),
      rules: rules.trim() || `The participant who wins the official contest takes the decision. Creator must report outcome before ${new Date(endDate).toLocaleDateString()}.`,
      endDate,
      seedAmount: Math.min(seedAmount, user.balance),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F141F] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
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

          {/* End Date & Resolution Deadline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Resolution Deadline
              </label>
              <span className="text-xs text-slate-400 font-medium">
                Ends: {new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { days: 1, label: '24 Hours' },
                { days: 3, label: '3 Days' },
                { days: 7, label: '1 Week' },
                { days: 14, label: '2 Weeks' },
              ].map((d) => (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setDeadlineDays(d.days);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    deadlineDays === d.days
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
