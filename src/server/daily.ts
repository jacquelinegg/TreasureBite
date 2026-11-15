const DEFAULT_TZ = 'Europe/Sofia'; // only for the shared daily post

/** Accepts a client-supplied IANA timezone; anything invalid becomes UTC. */
export function validTz(tz: unknown): string {
  if (typeof tz !== 'string' || tz.length > 64) return 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

/** YYYY-MM-DD in the given timezone (the player's own day). */
export const gameDay = (tz: string = DEFAULT_TZ, d = new Date()): string => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);

export function secondsIntoDay(tz: string = DEFAULT_TZ, d = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return n('hour') * 3600 + n('minute') * 60 + n('second');
}

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

export const prettyDay = (d = new Date()): string =>
  new Intl.DateTimeFormat('en', { timeZone: DEFAULT_TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(d);

/** Leaderboard score: fewer wrong guesses first, then earlier in the day. */
export const scoreFor = (wrong: number, secs: number): number => (10 - wrong) * 100000 + (86400 - secs);
export const wrongFromScore = (score: number): number => 10 - Math.floor(score / 100000);

export type StreakRec = { last: string; count: number };

export function bumpStreak(rec: StreakRec | null, today: string): StreakRec {
  if (rec?.last === today) return rec;
  if (rec && rec.last === addDays(today, -1)) return { last: today, count: rec.count + 1 };
  return { last: today, count: 1 };
}

/** A streak is alive if the last win was today or yesterday. */
export function liveStreak(rec: StreakRec | null, today: string): number {
  if (!rec) return 0;
  return rec.last === today || rec.last === addDays(today, -1) ? rec.count : 0;
}
