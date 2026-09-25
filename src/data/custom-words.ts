// Custom words are sent to AssemblyAI as `keyterms_prompt` to improve recognition of names and jargon.
// AssemblyAI allows up to 1,000 terms (fewer in practice) and at most 6 words per phrase; we stay well below that.
export const FREE_CUSTOM_WORDS = 5;
export const UNLOCKED_CUSTOM_WORDS = 25;
export const MAX_CUSTOM_WORDS = 100;
export const MAX_WORDS_PER_TERM = 6;
export const MAX_TERM_LENGTH = 50;
export function cleanCustomWords(input: unknown, limit = MAX_CUSTOM_WORDS): string[] {
 if (!Array.isArray(input)) return [];
 const seen = new Set<string>();
 const terms: string[] = [];
 for (const value of input) {
  if (typeof value !== 'string') continue;
  const term = value.replace(/\s+/g, ' ').trim().slice(0, MAX_TERM_LENGTH).trim();
  if (!term || term.split(' ').length > MAX_WORDS_PER_TERM) continue;
  const key = term.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  terms.push(term);
  if (terms.length >= limit) break;
 }
 return terms;
}
