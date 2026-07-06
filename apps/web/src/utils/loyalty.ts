export const getTierInfo = (currentPoints: number) => {
  if (currentPoints < 2000) {
    return {
      current: 'Silver Member',
      next: 'Gold Elite',
      remaining: 2000 - currentPoints,
      progress: (currentPoints / 2000) * 100,
      nextThreshold: 2000,
      color: 'from-slate-400 to-slate-500',
      badgeBg: 'bg-slate-500/10 text-slate-600 border border-slate-500/10',
      badgeBgGoldCard: 'bg-slate-500/20 text-slate-300'
    };
  } else if (currentPoints < 5000) {
    return {
      current: 'Gold Elite',
      next: 'Platinum Elite',
      remaining: 5000 - currentPoints,
      progress: ((currentPoints - 2000) / 3000) * 100,
      nextThreshold: 5000,
      color: 'from-amber-400 to-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 border border-amber-500/10',
      badgeBgGoldCard: 'bg-amber-500/20 text-brand-gold'
    };
  } else if (currentPoints < 15000) {
    return {
      current: 'Platinum Elite',
      next: 'Diamond VIP',
      remaining: 15000 - currentPoints,
      progress: ((currentPoints - 5000) / 10000) * 100,
      nextThreshold: 15000,
      color: 'from-indigo-400 to-indigo-500',
      badgeBg: 'bg-purple-500/10 text-purple-600 border border-purple-500/10',
      badgeBgGoldCard: 'bg-purple-500/20 text-purple-300'
    };
  } else {
    return {
      current: 'Diamond VIP',
      next: 'Tối đa',
      remaining: 0,
      progress: 100,
      nextThreshold: 15000,
      color: 'from-brand-gold to-yellow-500',
      badgeBg: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/10',
      badgeBgGoldCard: 'bg-yellow-500/20 text-yellow-300'
    };
  }
};
