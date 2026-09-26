import type { Metric, Technique } from "@/types";

/** Predetermined coaching bank — selected by weak metric (and optional variety seed). */
export type TechniqueEntry = Technique & { weakness: Metric };

export const TECHNIQUES: TechniqueEntry[] = [
  {
    name: "Point → Reason → Example → Conclusion",
    weakness: "Structure",
    why: "A clear sequence makes your reasoning easier to follow.",
    action:
      "State your answer in one sentence. Explain why, give one concrete example, and return to your point.",
    practice:
      "Take the same prompt again. Spend 10 seconds on your point, 15 on your reason, 25 on an example, and 10 on your conclusion.",
  },
  {
    name: "Signpost every turn",
    weakness: "Structure",
    why: "Listeners stay with you when they can hear where the answer is going.",
    action:
      "Open with “My point is…”, then “Because…”, then “For example…”, then “So…”.",
    practice:
      "Retell your last answer using those four phrases out loud, even if it feels mechanical.",
  },
  {
    name: "One idea, one sentence",
    weakness: "Conciseness",
    why: "Long or overlapping thoughts make listeners work harder to find your point.",
    action:
      "Finish one thought before introducing another. Replace repeated explanations with a short pause.",
    practice:
      "Retell your answer in three sentences. Give each sentence exactly one job.",
  },
  {
    name: "Cut the second explanation",
    weakness: "Conciseness",
    why: "Repeating the same claim with different words dilutes your strongest line.",
    action:
      "Say the idea once, then move to evidence or a close—don’t restate the claim.",
    practice:
      "Listen back and delete (out loud) any sentence that doesn’t add a new fact or example.",
  },
  {
    name: "Replace the filler with a breath",
    weakness: "Fluency",
    why: "A quiet beat is easier to follow than repeated verbal placeholders.",
    action:
      "When you feel a filler word coming, exhale gently and pause instead.",
    practice:
      "Speak for 30 seconds using a deliberate pause between each sentence. Listen back for your most frequent filler.",
  },
  {
    name: "Finish the sentence first",
    weakness: "Fluency",
    why: "Stopping mid-thought invites fillers while you search for the next word.",
    action:
      "Complete the sentence you started before switching ideas—even if the wording is imperfect.",
    practice:
      "Record 45 seconds. Every time you want to restart a sentence, pause and finish it instead.",
  },
  {
    name: "Make it concrete",
    weakness: "Clarity",
    why: "A specific example turns an abstract claim into something memorable.",
    action:
      "Choose one real person, place, or moment to illustrate your point.",
    practice:
      "Repeat your response with the phrase “For example…” followed by a specific situation.",
  },
  {
    name: "Name the thing",
    weakness: "Clarity",
    why: "Vague nouns force the listener to guess what you mean.",
    action:
      "Swap “this,” “that,” and “it” for the actual person, product, or idea.",
    practice:
      "Scan your transcript for vague pronouns and restate those lines with a concrete noun.",
  },
  {
    name: "The 3-second rule",
    weakness: "Spontaneity",
    why: "Searching for a perfect opening can interrupt the flow of an answer.",
    action:
      "Choose a simple position and start within three seconds. Develop your reasoning as you speak.",
    practice:
      "Try three new prompts. Give yourself only three seconds before saying your opening sentence.",
  },
  {
    name: "Speak the draft",
    weakness: "Spontaneity",
    why: "Waiting for a polished script kills momentum in live speaking.",
    action:
      "Say a rough first sentence out loud, then improve the next ones as you go.",
    practice:
      "Answer a prompt twice: first as a messy draft, second as a clean take of the same structure.",
  },
  {
    name: "Answer, then evidence",
    weakness: "Relevance",
    why: "Listeners need to hear how each idea connects to the question.",
    action:
      "Use the key subject of the prompt in your first sentence and tie your example back to it.",
    practice:
      "Write a one-sentence answer to the prompt. Use that exact sentence to begin your next recording.",
  },
  {
    name: "Echo the prompt",
    weakness: "Relevance",
    why: "Borrowing a key word from the question keeps your answer on track.",
    action:
      "Repeat one important word from the prompt in your opening and again near the end.",
    practice:
      "Underline two words in the prompt. Use both of them in your next 60-second answer.",
  },
  {
    name: "Trade vague words for precise ones",
    weakness: "Vocabulary",
    why: "Specific words communicate more with less explanation.",
    action:
      "Replace “things,” “good,” and “nice” with a concrete noun or descriptive verb.",
    practice:
      "Find three general words in your transcript and replace each with a more precise alternative.",
  },
  {
    name: "One vivid verb",
    weakness: "Vocabulary",
    why: "Strong verbs carry energy and reduce the need for filler adjectives.",
    action:
      "Pick one verb that does more work than “is,” “do,” or “get,” and build a sentence around it.",
    practice:
      "Retell your main point using a verb like “reshape,” “defend,” “unlock,” or “challenge.”",
  },
  {
    name: "Own your opening",
    weakness: "Confidence",
    why: "Repeated hedges can obscure the position you are trying to communicate.",
    action:
      "Start with “I believe…” and a direct answer, rather than apologizing or qualifying your idea.",
    practice:
      "Record your first sentence three times, removing a hedge each time. Listen for the clearest version.",
  },
  {
    name: "Drop the apology",
    weakness: "Confidence",
    why: "Prefacing with “sorry” or “I’m not sure” trains the listener to distrust your point.",
    action:
      "Cut opening apologies. State the claim, then add nuance if you need it.",
    practice:
      "Re-record your opener without “sorry,” “I guess,” or “maybe.” Keep the rest of the answer.",
  },
];

export const SESSION_TIPS = [
  {
    n: "01",
    title: "Start with your point",
    text: "A simple answer is a strong beginning.",
  },
  {
    n: "02",
    title: "Make it real",
    text: "Give one example your listener can picture.",
  },
  {
    n: "03",
    title: "Give yourself space",
    text: "A pause is better than a perfect script.",
  },
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Techniques tagged to a single metric. */
export function techniquesFor(metric: Metric): TechniqueEntry[] {
  return TECHNIQUES.filter((t) => t.weakness === metric);
}

/**
 * Pick one technique per weak metric.
 * Deterministic when `seed` is provided (same session → same tips);
 * pass a random seed for variety across attempts.
 */
export function pickTechniques(
  weakMetrics: Metric[],
  seed = "",
): TechniqueEntry[] {
  const base = hashSeed(seed);
  return weakMetrics.map((metric, i) => {
    const pool = techniquesFor(metric);
    if (!pool.length) {
      return (
        TECHNIQUES.find((t) => t.weakness === metric) || TECHNIQUES[0]
      );
    }
    return pool[(base + i * 17) % pool.length];
  });
}

export function techniqueWhy(metric: Metric): string {
  return techniquesFor(metric)[0]?.why || "This skill is worth another focused rep.";
}
