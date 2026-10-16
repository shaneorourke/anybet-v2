export function calculateOdds(poolX: number, poolY: number): { oddsX: number; oddsY: number; percentX: number; percentY: number } {
  const total = poolX + poolY;

  if (total === 0) {
    return {
      oddsX: 2.0,
      oddsY: 2.0,
      percentX: 50,
      percentY: 50,
    };
  }

  const pX = Math.max(1, poolX);
  const pY = Math.max(1, poolY);

  const rawOddsX = poolX === 0 ? 3.5 : Math.max(1.05, Math.min(25.0, total / pX));
  const rawOddsY = poolY === 0 ? 3.5 : Math.max(1.05, Math.min(25.0, total / pY));

  const percentX = Math.round((poolX / total) * 100);
  const percentY = 100 - percentX;

  return {
    oddsX: Number(rawOddsX.toFixed(2)),
    oddsY: Number(rawOddsY.toFixed(2)),
    percentX,
    percentY,
  };
}

export function calculateProjectedReturn(
  side: 'X' | 'Y',
  wagerAmount: number,
  poolX: number,
  poolY: number
): { projectedReturn: number; projectedProfit: number; effectiveOdds: number } {
  if (wagerAmount <= 0) {
    return { projectedReturn: 0, projectedProfit: 0, effectiveOdds: 2.0 };
  }

  const newPoolX = side === 'X' ? poolX + wagerAmount : poolX;
  const newPoolY = side === 'Y' ? poolY + wagerAmount : poolY;
  const newTotal = newPoolX + newPoolY;

  const relevantPool = side === 'X' ? newPoolX : newPoolY;
  const effectiveOdds = Math.max(1.05, Math.min(25.0, newTotal / relevantPool));
  const projectedReturn = Math.round(wagerAmount * effectiveOdds);
  const projectedProfit = Math.max(0, projectedReturn - wagerAmount);

  return {
    projectedReturn,
    projectedProfit,
    effectiveOdds: Number(effectiveOdds.toFixed(2)),
  };
}

export function formatCoins(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(amount));
}

export function getTimeRemaining(endDateStr: string): {
  isExpired: boolean;
  text: string;
  urgent: boolean;
} {
  const target = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { isExpired: true, text: 'Deadline Passed', urgent: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 1) {
    return { isExpired: false, text: `${days}d left`, urgent: false };
  }
  if (hours > 0) {
    return { isExpired: false, text: `${hours}h ${minutes}m left`, urgent: hours < 6 };
  }
  return { isExpired: false, text: `${minutes}m left`, urgent: true };
}

export interface EventTimingInfo {
  phase: 'upcoming' | 'live' | 'concluded';
  isLive: boolean;
  isExpired: boolean;
  hasStarted: boolean;
  startFormatted: string;
  startCountdown: string;
  endCountdown: string;
  statusBadge: {
    label: string;
    variant: 'upcoming' | 'live' | 'expired';
    pulse: boolean;
  };
}

/**
 * Computes exact timing lifecycle: Upcoming -> Live Now -> Concluded
 */
export function getEventTiming(startDateStr?: string, endDateStr?: string): EventTimingInfo {
  const now = Date.now();
  const end = endDateStr ? new Date(endDateStr).getTime() : now + 3600000;
  
  // If startDate is not provided, estimate based on endDate (e.g. 1.5 hours before conclusion)
  let start = startDateStr ? new Date(startDateStr).getTime() : end - 90 * 60 * 1000;
  if (isNaN(start)) {
    start = end - 90 * 60 * 1000;
  }

  const isExpired = now >= end;
  const hasStarted = now >= start;
  const isLive = hasStarted && !isExpired;

  // Format start time in human-friendly format
  const startDateObj = new Date(start);
  const isToday = startDateObj.toDateString() === new Date().toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = startDateObj.toDateString() === tomorrow.toDateString();

  const timeStr = startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = isToday ? `Today at ${timeStr}` : isTomorrow ? `Tomorrow at ${timeStr}` : `${startDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;

  // Countdown calculations
  const diffStart = start - now;
  let startCountdown = '';
  if (diffStart > 0) {
    const startHours = Math.floor(diffStart / (1000 * 60 * 60));
    const startMins = Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60));
    if (startHours >= 24) {
      const days = Math.floor(startHours / 24);
      startCountdown = `Starts in ${days}d`;
    } else if (startHours > 0) {
      startCountdown = `Starts in ${startHours}h ${startMins}m`;
    } else {
      startCountdown = `Starts in ${Math.max(1, startMins)}m`;
    }
  } else {
    const elapsedMins = Math.floor(Math.abs(diffStart) / (1000 * 60));
    startCountdown = elapsedMins < 60 ? `Started ${elapsedMins}m ago` : `Started`;
  }

  const diffEnd = end - now;
  let endCountdown = '';
  if (diffEnd > 0) {
    const endHours = Math.floor(diffEnd / (1000 * 60 * 60));
    const endMins = Math.floor((diffEnd % (1000 * 60 * 60)) / (1000 * 60));
    endCountdown = endHours > 0 ? `${endHours}h ${endMins}m left` : `${Math.max(1, endMins)}m left`;
  } else {
    endCountdown = 'Concluded';
  }

  let phase: 'upcoming' | 'live' | 'concluded' = 'upcoming';
  let statusBadge: EventTimingInfo['statusBadge'];

  if (isExpired) {
    phase = 'concluded';
    statusBadge = {
      label: 'Concluded · Ready to Settle',
      variant: 'expired',
      pulse: false,
    };
  } else if (isLive) {
    phase = 'live';
    statusBadge = {
      label: 'LIVE NOW · In Progress',
      variant: 'live',
      pulse: true,
    };
  } else {
    phase = 'upcoming';
    statusBadge = {
      label: startCountdown || `Starts ${dateStr}`,
      variant: 'upcoming',
      pulse: false,
    };
  }

  return {
    phase,
    isLive,
    isExpired,
    hasStarted,
    startFormatted: dateStr,
    startCountdown,
    endCountdown,
    statusBadge,
  };
}

export interface BroadcastPlatformInfo {
  platform: 'bbc' | 'twitch' | 'youtube' | 'kick' | 'skysports' | 'tnt' | 'dazn' | 'peacock' | 'espn' | 'netflix' | 'tv';
  name: string;
  shortName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ctaText: string;
  url: string;
}

/**
 * Detects appropriate broadcast platform from URL or event metadata
 * Avoids falsely labeling non-Twitch broadcasts (like BBC iPlayer, Premier League, YouTube) as Twitch.
 */
export function getBroadcastPlatformInfo(
  streamUrl?: string, 
  platformHint?: string, 
  leagueOrTitle?: string
): BroadcastPlatformInfo | null {
  const url = (streamUrl || '').trim();
  const lowerUrl = url.toLowerCase();
  const lowerHint = (platformHint || '').toLowerCase();
  const lowerContext = (leagueOrTitle || '').toLowerCase();

  // If no URL and no hint, return null
  if (!url && !platformHint) return null;

  // 1. BBC One / BBC iPlayer
  if (
    lowerUrl.includes('bbc.co.uk') || 
    lowerUrl.includes('iplayer') || 
    lowerHint.includes('bbc') || 
    lowerContext.includes('bbc') || 
    lowerContext.includes('traitor')
  ) {
    return {
      platform: 'bbc',
      name: 'BBC iPlayer & BBC One',
      shortName: 'BBC iPlayer',
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      badgeBorder: 'border-red-500/40',
      ctaText: 'Watch on BBC iPlayer',
      url: url || 'https://www.bbc.co.uk/iplayer',
    };
  }

  // 2. YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerHint.includes('youtube')) {
    return {
      platform: 'youtube',
      name: 'YouTube Live',
      shortName: 'YouTube',
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      badgeBorder: 'border-red-500/40',
      ctaText: 'Watch on YouTube',
      url: url || 'https://youtube.com',
    };
  }

  // 3. Kick
  if (lowerUrl.includes('kick.com') || lowerHint.includes('kick')) {
    return {
      platform: 'kick',
      name: 'Kick Live Stream',
      shortName: 'Kick',
      badgeBg: 'bg-emerald-500',
      badgeText: 'text-slate-950',
      badgeBorder: 'border-emerald-400',
      ctaText: 'Watch on Kick',
      url: url || 'https://kick.com',
    };
  }

  // 4. Twitch (ONLY when URL or hint explicitly specifies Twitch)
  if (lowerUrl.includes('twitch.tv') || lowerHint.includes('twitch')) {
    return {
      platform: 'twitch',
      name: 'Twitch Broadcast',
      shortName: 'Twitch',
      badgeBg: 'bg-[#9146FF]',
      badgeText: 'text-white',
      badgeBorder: 'border-[#9146FF]/50',
      ctaText: 'Watch on Twitch',
      url: url || 'https://twitch.tv',
    };
  }

  // 5. Sky Sports
  if (lowerUrl.includes('sky.com') || lowerHint.includes('sky') || lowerContext.includes('sky sports')) {
    return {
      platform: 'skysports',
      name: 'Sky Sports',
      shortName: 'Sky Sports',
      badgeBg: 'bg-sky-600',
      badgeText: 'text-white',
      badgeBorder: 'border-sky-500/40',
      ctaText: 'Watch on Sky Sports',
      url: url || 'https://www.skysports.com',
    };
  }

  // 6. TNT Sports
  if (lowerUrl.includes('tntsports') || lowerHint.includes('tnt')) {
    return {
      platform: 'tnt',
      name: 'TNT Sports',
      shortName: 'TNT Sports',
      badgeBg: 'bg-pink-600',
      badgeText: 'text-white',
      badgeBorder: 'border-pink-500/40',
      ctaText: 'Watch on TNT Sports',
      url: url || 'https://www.tntsports.co.uk',
    };
  }

  // 7. Peacock
  if (lowerUrl.includes('peacock') || lowerHint.includes('peacock')) {
    return {
      platform: 'peacock',
      name: 'Peacock TV',
      shortName: 'Peacock',
      badgeBg: 'bg-teal-600',
      badgeText: 'text-white',
      badgeBorder: 'border-teal-500/40',
      ctaText: 'Watch on Peacock',
      url: url || 'https://www.peacocktv.com',
    };
  }

  // 8. DAZN
  if (lowerUrl.includes('dazn') || lowerHint.includes('dazn')) {
    return {
      platform: 'dazn',
      name: 'DAZN Live',
      shortName: 'DAZN',
      badgeBg: 'bg-amber-400',
      badgeText: 'text-slate-950',
      badgeBorder: 'border-amber-300',
      ctaText: 'Watch on DAZN',
      url: url || 'https://www.dazn.com',
    };
  }

  // 9. ESPN
  if (lowerUrl.includes('espn') || lowerHint.includes('espn')) {
    return {
      platform: 'espn',
      name: 'ESPN / ESPN+',
      shortName: 'ESPN',
      badgeBg: 'bg-rose-700',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-600',
      ctaText: 'Watch on ESPN+',
      url: url || 'https://www.espn.com',
    };
  }

  // 10. Premier League Official Stream
  if (lowerUrl.includes('premierleague') || lowerContext.includes('premier league')) {
    return {
      platform: 'skysports',
      name: 'Sky Sports / Peacock (Premier League)',
      shortName: 'Sky / Peacock',
      badgeBg: 'bg-indigo-600',
      badgeText: 'text-white',
      badgeBorder: 'border-indigo-500/40',
      ctaText: 'Watch Match Broadcast',
      url: url || 'https://www.premierleague.com',
    };
  }

  // Default: Generic Official Broadcast
  return {
    platform: 'tv',
    name: platformHint || 'Official Broadcast',
    shortName: platformHint || 'Tune In Live',
    badgeBg: 'bg-slate-800 hover:bg-slate-700',
    badgeText: 'text-slate-200',
    badgeBorder: 'border-slate-700',
    ctaText: 'Tune In to Live Broadcast',
    url: url || '#',
  };
}

export function getDailyBonusStatus(lastClaimIso: string | null): {
  canClaim: boolean;
  timeRemainingText: string;
} {
  if (!lastClaimIso) {
    return { canClaim: true, timeRemainingText: 'Ready' };
  }
  const lastClaim = new Date(lastClaimIso).getTime();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const timePassed = now - lastClaim;

  if (timePassed >= oneDayMs) {
    return { canClaim: true, timeRemainingText: 'Ready' };
  }

  const remainingMs = oneDayMs - timePassed;
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return {
      canClaim: false,
      timeRemainingText: `${hours}h ${minutes}m`,
    };
  }
  return {
    canClaim: false,
    timeRemainingText: `${Math.max(1, minutes)}m`,
  };
}
