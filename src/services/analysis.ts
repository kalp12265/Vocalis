import { Analysis, AnalysisInput, Metric } from "@/types";
import { FILLER_WORDS } from "@/data/fillers";
export interface AnalysisProvider {
  analyze(input: AnalysisInput): Promise<Analysis>;
}
const clamp = (n: number) => Math.max(35, Math.min(96, Math.round(n)));
export function analyzeLocally(input: AnalysisInput): Analysis {
  const { transcript, duration, category, topic } = input;
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const lower = transcript.toLowerCase();
  const sentences = transcript
    .match(/[^.!?]+[.!?]*/g)
    ?.filter((x) => x.trim()) || [transcript];
  const fillers = FILLER_WORDS
    .map((word) => ({
      word,
      count: (lower.match(new RegExp("\\b" + word + "\\b", "g")) || []).length,
    }))
    .filter((x) => x.count > 0);
  const fillerCount = fillers.reduce((n, f) => n + f.count, 0);
  const unique =
    new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))).size /
    Math.max(1, words.length);
  const structureMarkers = (
    lower.match(
      /\b(first|second|because|for example|for instance|finally|in conclusion|so|ultimately|however)\b/g,
    ) || []
  ).length;
  const hasExample =
    /for example|for instance|when i|last year|last week|one time/i.test(
      transcript,
    );
  const avgLength = words.length / sentences.length;
  const topicWords = topic
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  const overlap = topicWords.filter((w) => lower.includes(w)).length;
  const rate = (words.length / Math.max(duration, 1)) * 60;
  const metrics: Record<Metric, number> = {
    Clarity: clamp(88 - Math.max(0, avgLength - 18) * 1.4),
    Structure: clamp(58 + structureMarkers * 6 + (hasExample ? 8 : 0)),
    Fluency: clamp(
      87 - fillerCount * 3 - (rate < 70 ? 8 : rate > 190 ? 12 : 0),
    ),
    Vocabulary: clamp(52 + unique * 38),
    Relevance: clamp(66 + overlap * 6),
    Spontaneity: clamp(60 + structureMarkers * 3),
    Confidence: clamp(
      78 -
        (lower.match(/maybe|i guess|i don't know|perhaps/g) || []).length * 5,
    ),
    Conciseness: clamp(91 - Math.max(0, avgLength - 17) * 1.8 - fillerCount),
  };
  const ranked = Object.entries(metrics).sort((a, b) => a[1] - b[1]);
  const first = sentences[0]?.trim() || "";
  const techniques = [
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
      name: "One idea, one sentence",
      weakness: "Conciseness",
      why: "Long or overlapping thoughts make listeners work harder to find your point.",
      action:
        "Finish one thought before introducing another. Replace repeated explanations with a short pause.",
      practice:
        "Retell your answer in three sentences. Give each sentence exactly one job.",
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
      name: "Make it concrete",
      weakness: "Clarity",
      why: "A specific example turns an abstract claim into something memorable.",
      action:
        "Choose one real person, place, or moment to illustrate your point.",
      practice:
        "Repeat your response with the phrase “For example…” followed by a specific situation.",
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
      name: "Answer, then evidence",
      weakness: "Relevance",
      why: "Listeners need to hear how each idea connects to the question.",
      action:
        "Use the key subject of the prompt in your first sentence and tie your example back to it.",
      practice:
        "Write a one-sentence answer to the prompt. Use that exact sentence to begin your next recording.",
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
      name: "Own your opening",
      weakness: "Confidence",
      why: "Repeated hedges can obscure the position you are trying to communicate.",
      action:
        "Start with “I believe…” and a direct answer, rather than apologizing or qualifying your idea.",
      practice:
        "Record your first sentence three times, removing a hedge each time. Listen for the clearest version.",
    },
  ];
  const strengths = [
    {
      title: hasExample ? "You made it concrete" : "You committed to an answer",
      detail: hasExample
        ? "Your response includes a specific example, giving listeners something tangible to connect with."
        : `Your opening gives us a starting point: “${first.slice(0, 145)}${first.length > 145 ? "…" : ""}”`,
    },
  ];
  if (structureMarkers > 1)
    strengths.push({
      title: "Signposts guide the listener",
      detail: `You used ${structureMarkers} connecting phrases to link your ideas. Keep those transitions intentional.`,
    });
  if (unique > 0.65)
    strengths.push({
      title: "Varied word choices",
      detail:
        "You use a range of words rather than leaning on the same vocabulary throughout.",
    });
  const mistakes = [];
  if (fillerCount)
    mistakes.push({
      title: "Filler words",
      detail: `Found ${fillerCount} possible fillers: ${fillers.map((f) => `“${f.word}” (${f.count})`).join(", ")}. Some, such as “like,” may be meaningful in context.`,
    });
  if (!hasExample)
    mistakes.push({
      title: "Ideas need evidence",
      detail:
        "There is no explicit example marker in your response. Give one concrete situation that supports your main point.",
    });
  if (structureMarkers < 2)
    mistakes.push({
      title: "Loose structure",
      detail:
        "Your answer has few clear signposts. Use “because,” “for example,” and a concluding sentence to make your logic visible.",
    });
  if (avgLength > 23)
    mistakes.push({
      title: "Long sentences",
      detail: `Your sentences average ${Math.round(avgLength)} words. Split your longest thought into two shorter sentences.`,
    });
  if (unique < 0.58)
    mistakes.push({
      title: "Repeated vocabulary",
      detail:
        "Several words recur throughout your answer. Check whether you are developing your idea or restating it.",
    });
  const weak_areas = ranked
    .slice(0, 3)
    .map(([name]) => ({
      name,
      detail: techniques.find((t) => t.weakness === name)!.why,
    }));
  const selected = weak_areas.map((w) =>
    techniques.find((t) => t.weakness === w.name)!,
  );
  let mode_metrics: Record<string, number> | undefined;
  if (category === "debate")
    mode_metrics = {
      "Argument quality": metrics.Structure,
      Evidence: hasExample ? 84 : 55,
      Persuasion: metrics.Clarity,
      Logic: metrics.Structure,
      Rebuttal: /however|although|some argue|on the other hand/i.test(
        transcript,
      )
        ? 83
        : 52,
    };
  if (category === "storytelling")
    mode_metrics = {
      Hook: metrics.Clarity,
      "Narrative structure": metrics.Structure,
      Specificity: hasExample ? 85 : 58,
      Emotion: /felt|afraid|happy|worried|excited|sad/i.test(transcript)
        ? 83
        : 60,
      Ending: /finally|learned|ultimately|in the end/i.test(transcript)
        ? 85
        : 60,
    };
  if (category === "interview")
    mode_metrics = {
      Professionalism: metrics.Conciseness,
      Relevance: metrics.Relevance,
      Structure: metrics.Structure,
      Evidence: hasExample ? 86 : 57,
    };
  return {
    overall_score: Math.round(
      Object.values(metrics).reduce((a, b) => a + b, 0) / 8,
    ),
    metrics,
    strengths,
    mistakes,
    filler_words: fillers,
    weak_areas,
    improvement_techniques: selected,
    coach_feedback: `Your next opportunity is ${ranked[0][0].toLowerCase()}. ${selected[0].action} Keep your original point, but use this technique on your next attempt.`,
    recommended_next_prompt: topic,
    words: words.length,
    provider: input.demo ? "demo" : "local",
    mode_metrics,
  };
}
export class LocalAnalysisProvider implements AnalysisProvider {
  async analyze(input: AnalysisInput) {
    return analyzeLocally(input);
  }
}
function validAnalysis(value: unknown): value is Analysis {
  if (!value || typeof value !== "object") return false;
  const a = value as Analysis;
  return (
    Number.isFinite(a.overall_score) &&
    a.overall_score >= 0 &&
    a.overall_score <= 100 &&
    !!a.metrics &&
    [
      "Clarity",
      "Structure",
      "Fluency",
      "Vocabulary",
      "Relevance",
      "Spontaneity",
      "Confidence",
      "Conciseness",
    ].every((k) => Number.isFinite(a.metrics[k as Metric])) &&
    Array.isArray(a.strengths) &&
    a.strengths.every(
      (x) => typeof x.title === "string" && typeof x.detail === "string",
    ) &&
    Array.isArray(a.mistakes) &&
    a.mistakes.every(
      (x) => typeof x.title === "string" && typeof x.detail === "string",
    ) &&
    Array.isArray(a.filler_words) &&
    a.filler_words.every(
      (x) => typeof x.word === "string" && Number.isFinite(x.count),
    ) &&
    Array.isArray(a.weak_areas) &&
    a.weak_areas.length > 0 &&
    a.weak_areas.every(
      (x) => typeof x.name === "string" && typeof x.detail === "string",
    ) &&
    Array.isArray(a.improvement_techniques) &&
    a.improvement_techniques.length > 0 &&
    a.improvement_techniques.every((x) =>
      ["name", "weakness", "why", "action", "practice"].every(
        (k) => typeof x[k as keyof typeof x] === "string",
      ),
    ) &&
    typeof a.coach_feedback === "string" &&
    typeof a.recommended_next_prompt === "string" &&
    Number.isFinite(a.words)
  );
}
const LLM_GATEWAY_URL = "https://llm-gateway.assemblyai.com/v1/chat/completions";
const METRIC_NAMES: Metric[] = [
  "Clarity",
  "Structure",
  "Fluency",
  "Vocabulary",
  "Relevance",
  "Spontaneity",
  "Confidence",
  "Conciseness",
];
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
const items = <T>(value: unknown, map: (x: Record<string, unknown>) => T | null, max: number) =>
  (Array.isArray(value) ? value : [])
    .map((x) => (x && typeof x === "object" ? map(x as Record<string, unknown>) : null))
    .filter((x): x is T => x !== null)
    .slice(0, max);
// Parses the model's JSON reply, dropping any reasoning text or code fences around it.
function parseReply(content: string): Record<string, unknown> | null {
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
// AssemblyAI LLM Gateway writes the coaching text. Scores, filler counts and word counts stay
// rule-based so they are consistent between sessions; any failure falls back to local coaching.
export class LlmGatewayAnalysisProvider implements AnalysisProvider {
  constructor(
    private apiKey: string,
    private model = process.env.LLM_GATEWAY_MODEL || "qwen3.5-4b-32k-fast",
  ) {}
  async analyze(input: AnalysisInput): Promise<Analysis> {
    const local = analyzeLocally(input);
    if (input.demo) return local;
    try {
      const weakest = Object.entries(local.metrics)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([name, score]) => `${name} ${score}`)
        .join(", ");
      const response = await fetch(LLM_GATEWAY_URL, {
        method: "POST",
        headers: { authorization: this.apiKey, "content-type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          temperature: 0.4,
          post_processing_steps: [{ type: "json-repair" }],
          messages: [
            {
              role: "system",
              content: `You are Vocalis, a warm, direct public speaking coach. You review a transcript of someone speaking about a prompt and coach them. Be specific: quote or refer to what they actually said. Never invent things they did not say. Reply with only one JSON object and nothing else, in exactly this shape:
{"strengths":[{"title":"","detail":""}],"mistakes":[{"title":"","detail":""}],"weak_areas":[{"name":"","detail":""}],"improvement_techniques":[{"name":"","weakness":"","why":"","action":"","practice":""}],"coach_feedback":"","recommended_next_prompt":""}
Rules: 2 to 3 strengths; 0 to 3 mistakes; 2 to 3 weak_areas; exactly 3 improvement_techniques. Every weak_areas.name and every improvement_techniques.weakness must be one of: ${METRIC_NAMES.join(", ")}. Each technique's weakness must match one of the weak_areas names. Keep each detail to one or two sentences. coach_feedback is 2 to 3 encouraging sentences. recommended_next_prompt is one new speaking prompt that practices their weakest skill.`,
            },
            {
              role: "user",
              content: `Prompt: ${input.topic}
Category: ${input.category}
Speaking time: ${input.duration} seconds, ${local.words} words
Filler words found: ${local.filler_words.map((f) => `${f.word} x${f.count}`).join(", ") || "none"}
Lowest rule-based scores: ${weakest}
Transcript:
"""${input.transcript.slice(0, 12000)}"""`,
            },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) return local;
      const body = await response.json();
      const reply = parseReply(body?.choices?.[0]?.message?.content || "");
      if (!reply) return local;
      const isMetric = (v: string): v is Metric => METRIC_NAMES.includes(v as Metric);
      const pair = (x: Record<string, unknown>) => {
        const title = text(x.title, 80);
        const detail = text(x.detail, 400);
        return title && detail ? { title, detail } : null;
      };
      const strengths = items(reply.strengths, pair, 3);
      const mistakes = items(reply.mistakes, pair, 3);
      const weak_areas = items<{ name: string; detail: string }>(reply.weak_areas, (x) => {
        const name = text(x.name, 40);
        const detail = text(x.detail, 400);
        return isMetric(name) && detail ? { name, detail } : null;
      }, 3);
      const improvement_techniques = items(reply.improvement_techniques, (x) => {
        const t = {
          name: text(x.name, 80),
          weakness: text(x.weakness, 40),
          why: text(x.why, 400),
          action: text(x.action, 400),
          practice: text(x.practice, 400),
        };
        return isMetric(t.weakness) && t.name && t.why && t.action && t.practice ? t : null;
      }, 3);
      const coach_feedback = text(reply.coach_feedback, 800);
      if (!strengths.length || !weak_areas.length || !improvement_techniques.length || !coach_feedback)
        return local;
      // Every technique needs a matching weak area so the results page can explain it.
      for (const t of improvement_techniques)
        if (!weak_areas.some((w) => w.name === t.weakness))
          weak_areas.push(
            local.weak_areas.find((w) => w.name === t.weakness) || {
              name: t.weakness,
              detail: t.why,
            },
          );
      return {
        ...local,
        strengths,
        mistakes,
        weak_areas,
        improvement_techniques,
        coach_feedback,
        recommended_next_prompt: text(reply.recommended_next_prompt, 300) || local.recommended_next_prompt,
        provider: "remote",
      };
    } catch {
      return local;
    }
  }
}
export function getAnalysisProvider(): AnalysisProvider {
  const endpoint = process.env.ANALYSIS_PROVIDER_URL;
  if (!endpoint) {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    return apiKey && process.env.LLM_GATEWAY_DISABLED !== "true"
      ? new LlmGatewayAnalysisProvider(apiKey)
      : new LocalAnalysisProvider();
  }
  return {
    async analyze(input) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ANALYSIS_API_KEY
            ? { Authorization: `Bearer ${process.env.ANALYSIS_API_KEY}` }
            : {}),
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok)
        throw new Error(
          "The analysis provider is unavailable. Please try again.",
        );
      const result: unknown = await response.json();
      if (!validAnalysis(result))
        throw new Error(
          "The analysis provider returned an incomplete response. Please try again.",
        );
      return { ...result, provider: "remote" };
    },
  };
}
