"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Square,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Play,
  FileText,
  Check,
  AlertCircle,
  Clock3,
  Download,
  Lock,
  Timer,
} from "lucide-react";
import { getCategory } from "@/data/topics";
import { useVocalis } from "@/hooks/use-vocalis";
import { useUnlock } from "@/hooks/use-unlock";
import { UNLOCK_COST, UNLOCK_MINUTES } from "@/data/rewards";
import { FREE_CUSTOM_WORDS, UNLOCKED_CUSTOM_WORDS } from "@/data/custom-words";
import CustomWords from "./custom-words";
import { Waveform, iconMap } from "./ui";
import { AudioRecorder } from "@/services/recording";
import {
  createTranscriptionService,
  TranscriptionService,
} from "@/services/transcription";
import {
  requestAnalysis,
  requestTopic,
  requestTranscription,
} from "@/services/client";
import { demoTranscript } from "@/data/demo";
import { Analysis, AnalysisInput, DetectedEntity } from "@/types";
const uniqueEntities = (list: DetectedEntity[]) =>
  list.filter(
    (e, i) =>
      list.findIndex(
        (x) => x.type === e.type && x.text.toLowerCase() === e.text.toLowerCase(),
      ) === i,
  );
type State = "ready" | "countdown" | "recording" | "review" | "processing";
const SAMPLE_TOPIC = "Why are mountains better than beaches?";
const LENGTHS = [60, 180, 300];
const formatLength = (seconds: number) => `${seconds / 60} min`;
export default function PracticeSession({ mode }: { mode: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { data, addSession, updateProfile } = useVocalis();
  const [categoryId, setCategoryId] = useState(mode);
  const category = getCategory(categoryId);
  const Icon = iconMap[category.icon];
  const [topic, setTopic] = useState(
    params.get("prompt") || category.prompts[0],
  );
  const [side, setSide] = useState<string | null>(
    mode === "debate" ? "ARGUE FOR" : null,
  );
  const [state, setState] = useState<State>("ready");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [limit, setLimit] = useState(() => {
    const requested = Number(params.get("length"));
    return LENGTHS.includes(requested) ? requested : 60;
  });
  const unlock = useUnlock();
  const unlockLength = unlock.minutes * 60;
  const customWords = data.profile.customWords || [];
  const wordAllowance = unlock.active ? UNLOCKED_CUSTOM_WORDS : FREE_CUSTOM_WORDS;
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [entities, setEntities] = useState<DetectedEntity[]>([]);
  const recorder = useRef<AudioRecorder | null>(null);
  const stt = useRef<TranscriptionService | null>(null);
  const mounted = useRef(true);
  const elapsedRef = useRef(0);
  const finishRef = useRef<() => void>(() => {});
  const run = useRef(0);
  const recordingStart = useRef(0);
  const stopped = useRef(false);
  const analyzing = useRef(false);
  // Feedback is requested in the background as soon as the transcript arrives, so it's usually
  // ready by the time the user taps Analyze. Reused only if the inputs haven't changed since.
  const prefetch = useRef<{ key: string; result: Promise<Analysis> } | null>(null);
  useEffect(() => {
    mounted.current = true;
    if (params.get("demo") === "true") {
      setTopic(SAMPLE_TOPIC);
      setCategoryId("everyday-life");
      setTranscript(demoTranscript);
      setElapsed(60);
      elapsedRef.current = 60;
      setIsDemo(true);
      setState("review");
    } else if (!params.get("prompt")) {
      let cancelled = false;
      requestTopic(mode)
        .then((result) => {
          if (!cancelled && mounted.current) {
            setTopic(result.prompt);
            setSide(result.side);
          }
        })
        .catch(() => {
          if (!cancelled && mounted.current)
            setNotice(
              "Using a saved prompt. You can still practice while the topic service reconnects.",
            );
        });
      return () => {
        cancelled = true;
        mounted.current = false;
        run.current++;
        recorder.current?.dispose();
        stt.current?.stop();
      };
    }
    ;
    return () => {
      mounted.current = false;
      run.current++;
      recorder.current?.dispose();
      stt.current?.stop();
    };
    // The session is initialized once; the route supplies a new keyed component for a new mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);
  useEffect(() => {
    if (state !== "recording") return;
    const interval = setInterval(() => {
      const seconds = Math.min(
        limit,
        Math.floor((Date.now() - recordingStart.current) / 1000),
      );
      elapsedRef.current = seconds;
      setElapsed(seconds);
      if (seconds >= limit) finishRef.current();
    }, 200);
    return () => clearInterval(interval);
  }, [state, limit]);
  useEffect(() => {
    // Keep a long selection in step with the unlock: fall back when it expires, follow it when upgraded.
    if (state !== "ready" || limit <= LENGTHS.at(-1)!) return;
    if (!unlock.active) setLimit(LENGTHS.at(-1)!);
    else if (limit !== unlockLength) setLimit(unlockLength);
  }, [unlock.active, unlockLength, state, limit]);
  useEffect(() => {
    if (state !== "processing") return;
    const interval = setInterval(
      () => setProcessingStep((s) => Math.min(s + 1, 2)),
      400,
    );
    return () => clearInterval(interval);
  }, [state]);
  async function newTopic() {
    setLoadingTopic(true);
    setError("");
    try {
      const result = await requestTopic(categoryId, topic);
      setTopic(result.prompt);
      setSide(result.side);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load a new topic. Try again.",
      );
    } finally {
      setLoadingTopic(false);
    }
  }
  async function start() {
    setError("");
    setNotice("");
    setTranscript("");
    setEntities([]);
    setElapsed(0);
    elapsedRef.current = 0;
    setIsDemo(false);
    setAudioUrl("");
    stopped.current = false;
    const thisRun = ++run.current;
    setState("countdown");
    for (let n = 3; n > 0; n--) {
      setCountdown(n);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!mounted.current || thisRun !== run.current) return;
    }
    setCountdown(0);
    try {
      recorder.current = new AudioRecorder();
      await recorder.current.start();
      if (!mounted.current || thisRun !== run.current) {
        recorder.current.dispose();
        return;
      }
      stt.current = createTranscriptionService();
      const supported = stt.current.start(
        (text) => {
          if (mounted.current) setTranscript(text);
        },
        (message) => {
          if (mounted.current) setNotice(message);
        },
      );
      if (!supported)
        setNotice(
          "This browser does not support live transcription. Your audio will still record. Listen back and add the transcript before analysis, or try Chrome or Edge.",
        );
      recordingStart.current = Date.now();
      setState("recording");
    } catch (e) {
      if (!mounted.current) return;
      recorder.current?.dispose();
      const denied =
        e instanceof DOMException &&
        (e.name === "NotAllowedError" || e.name === "PermissionDeniedError");
      setError(
        denied
          ? "Microphone access was denied. Allow microphone access in your browser’s site settings, then try again. You can also paste a transcript or explore the demo."
          : e instanceof Error
            ? e.message
            : "Recording could not start. Check your microphone and try again.",
      );
      setState("ready");
    }
  }
  async function finish() {
    if (stopped.current) return;
    stopped.current = true;
    stt.current?.stop();
    elapsedRef.current = Math.max(
      1,
      Math.min(limit, Math.round((Date.now() - recordingStart.current) / 1000)),
    );
    setElapsed(elapsedRef.current);
    setState("review");
    try {
      const audio = await recorder.current?.stop();
      if (!audio?.size || !mounted.current) {
        if (mounted.current)
          setNotice(
            "No audio was captured. You can still review your transcript, or record another attempt.",
          );
        return;
      }
      setAudioUrl(URL.createObjectURL(audio));
      setTranscribing(true);
      setNotice("Transcribing your recording with AssemblyAI…");
      try {
        const result = await requestTranscription(
          audio,
          side ? `${side}: ${topic}` : topic,
          customWords.slice(0, wordAllowance),
        );
        if (!mounted.current) return;
        if (result.text.trim()) {
          setTranscript(result.text.trim());
          setEntities(result.entities || []);
          setNotice("");
          prefetchAnalysis(result.text.trim());
        } else
          setNotice(
            "AssemblyAI could not detect speech in this recording. You can type your transcript below.",
          );
      } catch (e) {
        if (mounted.current)
          setNotice(
            e instanceof Error
              ? e.message
              : "Automatic transcription is unavailable. Review or edit the transcript below before analyzing.",
          );
      } finally {
        if (mounted.current) setTranscribing(false);
      }
    } catch {
      setError(
        "The audio recording could not be finalized. Your transcript is still available—review it below or try recording again.",
      );
    }
  }
  finishRef.current = () => {
    void finish();
  };
  function cancelCountdown() {
    run.current++;
    recorder.current?.dispose();
    setState("ready");
  }
  function useDemo() {
    setTopic(SAMPLE_TOPIC);
    setSide(null);
    setCategoryId("everyday-life");
    setTranscript(demoTranscript);
    setIsDemo(true);
    setElapsed(60);
    elapsedRef.current = 60;
    setAudioUrl("");
    setError("");
    setNotice(
      "This is a sample transcript, not a recording of your voice. Demo sessions are clearly labeled in your history.",
    );
    setState("review");
  }
  function manual() {
    setIsDemo(false);
    setElapsed(limit);
    elapsedRef.current = limit;
    setError("");
    setTranscript("");
    setAudioUrl("");
    setNotice(
      `Paste what you said or transcribe your own recording. Feedback is based on this text; ${limit} seconds is used as the estimated speaking duration.`,
    );
    setState("review");
  }
  function analysisInput(text: string): AnalysisInput {
    return {
      transcript: text,
      topic: side ? `${side}: ${topic}` : topic,
      category: categoryId,
      duration: Math.max(1, elapsedRef.current),
      demo: isDemo,
    };
  }
  function prefetchAnalysis(text: string) {
    const input = analysisInput(text);
    if (input.demo || text.split(/\s+/).length < 5) return;
    const result = requestAnalysis(input);
    result.catch(() => {});
    prefetch.current = { key: JSON.stringify(input), result };
  }
  async function analyze() {
    if (analyzing.current) return;
    if (transcript.trim().split(/\s+/).length < 5) {
      setError("Add at least five words to your transcript before analyzing.");
      return;
    }
    analyzing.current = true;
    setError("");
    setState("processing");
    setProcessingStep(0);
    try {
      const input = analysisInput(transcript);
      const cached =
        prefetch.current?.key === JSON.stringify(input)
          ? prefetch.current.result.catch(() => requestAnalysis(input))
          : requestAnalysis(input);
      prefetch.current = null;
      const [analysis] = await Promise.all([
        cached,
        // A brief minimum so the progress steps don't flash past.
        new Promise((resolve) => setTimeout(resolve, 900)),
      ]);
      if (!mounted.current) return;
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (!mounted.current) return;
      const id = crypto.randomUUID();
      addSession({
        id,
        date: new Date().toISOString(),
        category: categoryId,
        topic: side ? `${side}: ${topic}` : topic,
        duration: Math.max(1, elapsedRef.current),
        transcript,
        analysis,
        demo: isDemo,
        // Keep only entities still present if the transcript was edited before analysis.
        entities: uniqueEntities(entities).filter((e) =>
          transcript.toLowerCase().includes(e.text.toLowerCase()),
        ),
      });
      router.push(`/session/${id}`);
    } catch (e) {
      if (mounted.current) {
        setError(
          e instanceof Error
            ? e.message
            : "Analysis failed. Your transcript is safe. Please try again.",
        );
        setState("review");
      }
    } finally {
      analyzing.current = false;
    }
  }
  const remaining = limit - elapsed;
  return (
    <div className="practice-page">
      <div className="practice-breadcrumb">
        <Link href="/practice" className="back-link">
          <ArrowLeft size={13} />
          All speaking categories
        </Link>
        <span className="subtle-tag">
          {isDemo ? "DEMO SESSION" : "YOUR PRACTICE. YOUR PACE."}
        </span>
      </div>
      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={17} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="demo-banner" role="status">
          <span>{notice}</span>
        </div>
      )}
      {state === "processing" ? (
        <section className="practice-card analysis-loading" aria-live="polite">
          <span className="loading-orb">
            <Sparkles size={27} />
          </span>
          <h2>
            {processingStep === 3
              ? "Your results are ready."
              : "A closer listen. A clearer path."}
          </h2>
          <p>Your words are becoming your next opportunity to improve.</p>
          <div className="loading-steps">
            {[
              "Transcript ready for analysis",
              "Analyzing structure and speaking patterns",
              "Preparing specific coaching techniques",
              "Your results are ready",
            ].map((text, i) => (
              <div
                key={text}
                className={`loading-step ${processingStep > i ? "done" : processingStep === i ? "current" : ""}`}
              >
                <span>
                  {processingStep > i || processingStep === 3 ? (
                    <Check size={12} />
                  ) : (
                    i + 1
                  )}
                </span>
                {text}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="practice-card">
            <div className="practice-topline">
              <span>
                <Icon size={15} />
                {category.name}
                <span>·</span>
                <span
                  className={`difficulty ${category.difficulty.toLowerCase()}`}
                >
                  {category.difficulty}
                </span>
              </span>
              <span>
                <Clock3 size={12} />
                {isDemo ? "1 min" : formatLength(limit)} practice
              </span>
            </div>
            <div className="practice-topic">
              <div className="eyebrow">
                <span />
                YOUR TOPIC
              </div>
              {side && (
                <span className="debate-side" style={{ marginTop: 16 }}>
                  {side}
                </span>
              )}
              <h1>{topic}</h1>
              <p>
                {state === "review"
                  ? "Your words are the starting point. Let’s find what comes next."
                  : `Speak for ${limit === 60 ? "60 seconds" : `${limit / 60} minutes`}. No scripts. No perfect answers.`}
              </p>
              {state === "ready" && (
                <button
                  className="new-prompt"
                  disabled={loadingTopic}
                  onClick={newTopic}
                >
                  <RotateCw size={12} />
                  {loadingTopic
                    ? "Finding a new perspective…"
                    : "Give me another prompt"}
                </button>
              )}
            </div>
            {state !== "review" && (
              <div className="record-zone">
                {state === "ready" && (
                  <div
                    className="length-picker"
                    role="radiogroup"
                    aria-label="Practice length"
                  >
                    {LENGTHS.map((seconds) => (
                      <button
                        key={seconds}
                        role="radio"
                        aria-checked={limit === seconds}
                        className={`filter-pill ${limit === seconds ? "active" : ""}`}
                        onClick={() => setLimit(seconds)}
                      >
                        {formatLength(seconds)}
                      </button>
                    ))}
                    {unlock.active ? (
                      <button
                        role="radio"
                        aria-checked={limit === unlockLength}
                        className={`filter-pill length-unlocked ${limit === unlockLength ? "active" : ""}`}
                        onClick={() => setLimit(unlockLength)}
                        title={`Unlocked for ${unlock.label}`}
                      >
                        <Timer size={11} />
                        {formatLength(unlockLength)}
                        <small>{unlock.label}</small>
                      </button>
                    ) : (
                      <button
                        role="radio"
                        aria-checked={false}
                        className="filter-pill length-locked"
                        disabled
                        title={`Redeem ${UNLOCK_COST} points in the top bar to unlock ${UNLOCK_MINUTES}+ minute sessions for 1 hour`}
                      >
                        <Lock size={10} />
                        {UNLOCK_MINUTES}+ min
                      </button>
                    )}
                  </div>
                )}
                <div
                  className={`session-timer ${remaining <= 10 && state === "recording" ? "warning" : ""}`}
                  aria-label={
                    state === "countdown"
                      ? `Get ready: ${countdown}`
                      : `${remaining} seconds remaining`
                  }
                >
                  {state === "countdown"
                    ? countdown || "…"
                    : `${String(Math.floor((state === "ready" ? limit : remaining) / 60)).padStart(2, "0")}:${String((state === "ready" ? limit : remaining) % 60).padStart(2, "0")}`}
                </div>
                <div
                  className={`record-progress ${remaining <= 10 && state === "recording" ? "warning" : ""}`}
                  role="progressbar"
                  aria-label="Speaking time used"
                  aria-valuemin={0}
                  aria-valuemax={limit}
                  aria-valuenow={state === "recording" ? elapsed : 0}
                >
                  <i
                    style={{
                      width: `${state === "recording" ? Math.min(100, (elapsed / limit) * 100) : 0}%`,
                    }}
                  />
                </div>
                <div
                  className={`record-status ${state === "recording" ? "listening" : ""}`}
                  aria-live="polite"
                >
                  {state === "ready"
                    ? "Ready when you are."
                    : state === "countdown"
                      ? countdown
                        ? "Get ready. Take a breath."
                        : "Waiting for microphone permission…"
                      : remaining <= 10
                        ? "10 seconds remaining. Bring your thought home."
                        : "Listening… this is your moment."}
                </div>
                <div
                  className={`record-wave ${state === "recording" ? "is-recording" : ""}`}
                >
                  <Waveform active={state === "recording"} />
                </div>
                <button
                  className={`record-mic ${state === "recording" ? "recording" : ""}`}
                  onClick={() =>
                    state === "recording"
                      ? void finish()
                      : state === "countdown"
                        ? cancelCountdown()
                        : void start()
                  }
                  aria-label={
                    state === "recording"
                      ? "Stop recording"
                      : state === "countdown"
                        ? "Cancel countdown"
                        : "Start microphone recording"
                  }
                >
                  {state === "recording" ? (
                    <Square size={26} fill="currentColor" />
                  ) : state === "countdown" ? (
                    <Square size={22} />
                  ) : (
                    <Mic size={30} />
                  )}
                </button>
                <span className="record-hint">
                  {state === "recording"
                    ? `${elapsed}s recorded · Tap to finish`
                    : state === "countdown"
                      ? "Tap to cancel"
                      : "Tap the mic to begin"}
                </span>
                {state === "recording" && transcript && (
                  <p className="transcript-live" aria-label="Live transcript">
                    {transcript}
                  </p>
                )}
              </div>
            )}
            {state === "ready" && (
              <CustomWords
                words={customWords}
                allowance={wordAllowance}
                unlocked={unlock.active}
                onChange={(words) => updateProfile({ customWords: words })}
              />
            )}
            <div className="practice-bottom">
              <ShieldCheck size={13} />
              <span>
                Your recording is sent to AssemblyAI to generate a transcript;
                analysis then runs on that text. English supported.
              </span>
            </div>
          </section>
          {state === "ready" && (
            <div className="practice-alternatives">
              <button onClick={useDemo}>
                <Play size={11} />
                Try a demo session
              </button>
              <span>or</span>
              <button onClick={manual}>
                <FileText size={11} />
                Use your own transcript
              </button>
            </div>
          )}
          {state === "review" && (
            <section className="panel transcript-editor">
              <div className="panel-heading">
                <div>
                  <h2>
                    {isDemo
                      ? "Explore the sample transcript"
                      : "Review your transcript"}
                  </h2>
                  <p>
                    {isDemo
                      ? "A sample 60-second response to show you the full experience."
                      : "Correct any transcription errors before getting your feedback."}
                  </p>
                </div>
                <span className="subtle-tag">
                  {elapsed}s ·{" "}
                  {transcript.trim()
                    ? transcript.trim().split(/\s+/).length
                    : 0}{" "}
                  words
                </span>
              </div>
              {audioUrl && (
                <>
                  <audio
                    controls
                    src={audioUrl}
                    aria-label="Play your speaking recording"
                  />
                  <a
                    href={audioUrl}
                    download="vocalis-practice.webm"
                    className="text-link"
                    style={{ fontSize: 10, marginBottom: 13 }}
                  >
                    <Download size={12} />
                    Save your recording
                  </a>
                </>
              )}
              <label htmlFor="session-transcript" className="sr-only">
                Session transcript
              </label>
              <textarea
                id="session-transcript"
                value={transcript}
                maxLength={25000}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your transcript goes here. If live transcription wasn’t available, listen to your recording and add what you said."
              />
              <p className="editor-note">
                Feedback uses a local text-based coaching model unless an
                external provider is configured. Voice qualities and pauses are
                not measured from this transcript.
              </p>
              <div className="editor-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setState("ready");
                    setNotice("");
                    setError("");
                    setIsDemo(false);
                    setAudioUrl("");
                  }}
                >
                  <RotateCw
                    size={12}
                    style={{ display: "inline", marginRight: 5 }}
                  />
                  Record again
                </button>
                <button
                  className="button button-primary"
                  onClick={analyze}
                  disabled={
                    transcribing || transcript.trim().split(/\s+/).length < 5
                  }
                >
                  {transcribing ? "Transcribing…" : "Analyze my response"}{" "}
                  <Sparkles size={15} />
                </button>
              </div>
            </section>
          )}
          {state !== "review" && (
            <div className="session-tips">
              {[
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
              ].map((t) => (
                <div className="session-tip" key={t.n}>
                  <span>{t.n}</span>
                  <div>
                    <strong>{t.title}</strong>
                    <p>{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
