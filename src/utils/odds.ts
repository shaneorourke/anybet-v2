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
