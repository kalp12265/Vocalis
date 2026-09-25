import { categories, getCategory } from '@/data/topics';
import { Difficulty, Session } from '@/types';
export const SESSION_POINTS: Record<Difficulty, number> = { Beginner: 10, Intermediate: 20, Advanced: 30, Chaotic: 50 };
export const LEVEL_BONUS: Record<Difficulty, number> = { Beginner: 50, Intermediate: 100, Advanced: 150, Chaotic: 250 };
export const LEVELS: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Chaotic'];
export const UNLOCK_DURATION_MS = 60 * 60 * 1000;
// Each tier unlocks sessions up to that many minutes, in every category, for UNLOCK_DURATION_MS.
export const UNLOCK_TIERS = [
 { minutes: 10, cost: 150 },
 { minutes: 15, cost: 250 },
 { minutes: 20, cost: 400 },
];
export const UNLOCK_COST = UNLOCK_TIERS[0].cost;
export const UNLOCK_MINUTES = UNLOCK_TIERS[0].minutes;
// Shown in the shop; checkout isn't connected yet, so buying doesn't credit anything.
export const POINT_PACKS = [
 { id: 'starter', points: 500, price: '$2.99' },
 { id: 'speaker', points: 1500, price: '$6.99', tag: 'Popular' },
 { id: 'orator', points: 4000, price: '$14.99', tag: 'Best value' },
];
// Very short attempts don't earn points, so points can't be farmed by tapping record and stop.
export const MIN_SCORING_SECONDS = 20;
const cleanTopic = (topic: string) => topic.replace(/^ARGUE (FOR|AGAINST): /, '');
export function sessionPoints(session: Session) {
 if (session.demo || session.duration < MIN_SCORING_SECONDS) return 0;
 return SESSION_POINTS[getCategory(session.category).difficulty];
}
// Daily Chaos Challenge: this many Chaotic sessions of at least this length in one day earns the bonus, once per day.
export const CHAOS_CHALLENGE = { attempts: 3, minSeconds: 180, bonus: 75 };
const dayKey = (date: Date) => date.toDateString();
function chaosDays(sessions: Session[]) {
 const days = new Map<string, number>();
 for (const s of sessions) if (!s.demo && s.category === 'chaotic' && s.duration >= CHAOS_CHALLENGE.minSeconds) { const key = dayKey(new Date(s.date)); days.set(key, (days.get(key) || 0) + 1); }
 return days;
}
export function getChaosChallenge(sessions: Session[], now = new Date()) {
 const done = Math.min(CHAOS_CHALLENGE.attempts, chaosDays(sessions).get(dayKey(now)) || 0);
 return { done, complete: done >= CHAOS_CHALLENGE.attempts };
}
export function getRewards(sessions: Session[], spent = 0) {
 const practiced = new Set(sessions.filter(s => sessionPoints(s) > 0).map(s => cleanTopic(s.topic)));
 const levels = LEVELS.map(level => {
  const prompts = categories.filter(c => c.difficulty === level).flatMap(c => c.prompts);
  const done = prompts.filter(p => practiced.has(p)).length;
  return { level, done, total: prompts.length, complete: prompts.length > 0 && done === prompts.length, bonus: LEVEL_BONUS[level] };
 });
 const chaosBonus = [...chaosDays(sessions).values()].filter(n => n >= CHAOS_CHALLENGE.attempts).length * CHAOS_CHALLENGE.bonus;
 const earned = sessions.reduce((n, s) => n + sessionPoints(s), 0) + levels.reduce((n, l) => n + (l.complete ? l.bonus : 0), 0) + chaosBonus;
 return { earned, balance: Math.max(0, earned - spent), levels };
}
