export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Chaotic';
export type Metric = 'Clarity' | 'Structure' | 'Fluency' | 'Vocabulary' | 'Relevance' | 'Spontaneity' | 'Confidence' | 'Conciseness';
export interface Category { id: string; name: string; description: string; icon: string; difficulty: Difficulty; color: string; prompts: string[]; }
export interface Technique { name: string; weakness: string; why: string; action: string; practice: string; }
export interface Analysis {
 overall_score: number;
 metrics: Record<Metric, number>;
 strengths: { title: string; detail: string }[];
 mistakes: { title: string; detail: string }[];
 filler_words: { word: string; count: number }[];
 weak_areas: { name: string; detail: string }[];
 improvement_techniques: Technique[];
 coach_feedback: string;
 recommended_next_prompt: string;
 words: number;
 provider: 'local' | 'remote' | 'demo';
 mode_metrics?: Record<string, number>;
}
export interface Session { id: string; date: string; category: string; topic: string; duration: number; transcript: string; analysis: Analysis; demo: boolean; }
export interface Profile { name: string; goals: string[]; comfort: string; onboarded: boolean; }
export interface AnalysisInput { transcript: string; topic: string; category: string; duration: number; demo?: boolean; }
export interface UserData { profile: Profile; sessions: Session[]; }
