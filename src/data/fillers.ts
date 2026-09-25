// Filler words counted in analysis and highlighted in transcripts.
// AssemblyAI only keeps hesitations like "um" and "uh" when `disfluencies: true` is set on the transcript request.
export const FILLER_WORDS = ['um', 'umm', 'uh', 'uhm', 'er', 'erm', 'hmm', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of'];
export const FILLER_PATTERN = new RegExp(`(\\b(?:${[...FILLER_WORDS].sort((a, b) => b.length - a.length).join('|')})\\b)`, 'gi');
