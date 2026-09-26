"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp,
  Mic,
  FileText,
  CircleHelp,
} from "lucide-react";
import { useVocalis } from "@/hooks/use-vocalis";
import { getCategory } from "@/data/topics";
import { sessionPoints } from "@/data/rewards";
import { FILLER_PATTERN } from "@/data/fillers";
import VoiceCoach from "./voice-coach";
import {
  PageHeading,
  ButtonLink,
  ScoreRing,
  EmptyState,
  Badge,
  Card,
  CardHeader,
  Progress,
  Eyebrow,
} from "./ui";

export default function SessionResults({ id }: { id: string }) {
  const { data } = useVocalis();
  const index = data.sessions.findIndex((s) => s.id === id);
  const session = data.sessions[index];
  if (!session)
    return (
      <EmptyState
        title="This session isn’t in this browser."
        description="Sessions are saved locally on the device you practiced with. Find your saved sessions in History or start a new speaking moment."
      />
    );
  const a = session.analysis;
  const previous = index > 0 ? data.sessions[index - 1] : null;
  const improvement = previous
    ? a.overall_score - previous.analysis.overall_score
    : null;
  const strongest = Object.entries(a.metrics).sort((x, y) => y[1] - x[1])[0];
  const fillers = a.filler_words.reduce((n, f) => n + f.count, 0);
  const retry = `/practice/${session.category}?prompt=${encodeURIComponent(session.topic.replace(/^ARGUE (FOR|AGAINST): /, ""))}`;
  const pieces = session.transcript.split(FILLER_PATTERN);

  return (
    <>
      <Link href="/history" className="back-link" style={{ marginBottom: 23 }}>
        <ArrowLeft size={13} />
        Your session history
      </Link>
      <PageHeading
        label="ONE MORE STEP TOWARD A STRONGER VOICE"
        title="Session complete. Progress made."
        description="Here’s what we noticed—and what to try next."
        action={
          <ButtonLink href={retry}>
            Practice again <Mic size={15} />
          </ButtonLink>
        }
      />
      <div className="demo-banner">
        <CircleHelp size={14} style={{ flexShrink: 0 }} />
        <span>
          {session.demo
            ? "Sample session · These results demonstrate the coaching experience."
            : a.provider === "remote"
              ? "AI coaching · Scores are guidance for practice, not scientific measurements."
              : "Local coaching · Text-based estimates, not an acoustic or scientific assessment. Confidence and spontaneity are language-based proxies."}
        </span>
      </div>
      <section className="results-hero">
        <ScoreRing score={a.overall_score} />
        <div>
          <Eyebrow>YOUR SPEAKING SNAPSHOT</Eyebrow>
          <h2>{session.topic}</h2>
          <p>
            {getCategory(session.category).name} ·{" "}
            {new Date(session.date).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {session.demo ? "Demo session" : "Personal practice"}
          </p>
          {sessionPoints(session) > 0 && (
            <Badge variant="points">⚡ +{sessionPoints(session)} points</Badge>
          )}
          {improvement !== null && (
            <Badge
              variant="improvement"
              icon={<TrendingUp size={12} />}
            >
              {improvement >= 0 ? "+" : ""}
              {improvement} from your previous session
            </Badge>
          )}
        </div>
      </section>
      <div className="results-summary">
        <div>
          <span>Speaking time</span>
          <strong>{session.duration} seconds</strong>
        </div>
        <div>
          <span>Words spoken</span>
          <strong>{a.words}</strong>
        </div>
        <div>
          <span>Possible filler words</span>
          <strong>{fillers}</strong>
        </div>
        <div>
          <span>Strongest skill</span>
          <strong>{strongest[0]}</strong>
        </div>
      </div>
      <div className="results-columns">
        <div>
          <Card>
            <h2 className="feedback-title">
              <Target />
              Your speaking metrics
            </h2>
            <div className="metric-grid">
              {Object.entries(a.metrics).map(([name, value]) => (
                <Progress
                  key={name}
                  label={name}
                  value={value}
                  display={`${value} / 100`}
                  warn={value < 75}
                />
              ))}
            </div>
            <p className="muted-note">
              Coaching indicators help you reflect on patterns. They are not a
              certification of speaking ability. Pauses and vocal delivery are
              not measured in local mode.
            </p>
          </Card>
          <Card>
            <h2 className="feedback-title">
              <CheckCircle2 />
              What you did well
            </h2>
            {a.strengths.map((s, i) => (
              <div className="feedback-item" key={i}>
                <h4>{s.title}</h4>
                <p>{s.detail}</p>
              </div>
            ))}
          </Card>
          <Card>
            <h2 className="feedback-title orange-text">
              <AlertCircle />
              Your blunders
            </h2>
            {a.mistakes.length ? (
              a.mistakes.map((m, i) => (
                <div className="feedback-item issue" key={i}>
                  <h4>{m.title}</h4>
                  <p>{m.detail}</p>
                </div>
              ))
            ) : (
              <p className="muted-note">
                No major text-pattern flags were found. Listen back to assess
                your pacing, pauses, and delivery.
              </p>
            )}
            {a.filler_words.length > 0 && (
              <div
                className="pill-filters"
                style={{ marginTop: 18, marginBottom: 0 }}
              >
                {a.filler_words.map((f) => (
                  <Badge key={f.word}>
                    {f.word} × {f.count}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <h2 className="feedback-title">
              <Sparkles />
              Small techniques. Big difference.
            </h2>
            <p className="muted-note" style={{ marginTop: -8 }}>
              Turn your next opportunity into something you can practice.
            </p>
            {!session.demo && a.improvement_techniques.length > 0 && (
              <VoiceCoach
                topic={session.topic}
                transcript={session.transcript}
                techniques={a.improvement_techniques}
                feedback={a.coach_feedback}
              />
            )}
            {a.improvement_techniques.map((t, i) => (
              <article className="technique-card" key={i}>
                <span className="tiny-label">
                  TECHNIQUE 0{i + 1} · {t.weakness.toUpperCase()}
                </span>
                <h3>{t.name}</h3>
                <p>
                  <b>What to work on:</b>{" "}
                  {a.weak_areas.find((w) => w.name === t.weakness)?.detail}
                </p>
                <p>
                  <b>Why it matters:</b> {t.why}
                </p>
                <p>
                  <b>What to do:</b> {t.action}
                </p>
                <div className="practice-exercise">
                  <strong>YOUR NEXT REP</strong>
                  {t.practice}
                </div>
              </article>
            ))}
          </Card>
        </div>
        <div>
          <Card className="coach-panel">
            <h2 className="feedback-title">
              <Sparkles />
              Your Vocalis Coach
            </h2>
            <p>{a.coach_feedback}</p>
            <ButtonLink href={retry}>
              Try again with this technique <ArrowUpRight size={14} />
            </ButtonLink>
          </Card>
          <Card>
            <h2 className="feedback-title">
              <Target />
              Your weak areas
            </h2>
            {a.weak_areas.map((w, i) => (
              <div className="weak-area" key={i}>
                <span>{i + 1}</span>
                <div>
                  <h4>{w.name}</h4>
                  <p>{w.detail}</p>
                </div>
              </div>
            ))}
          </Card>
          {a.mode_metrics && (
            <Card>
              <h2 className="feedback-title">
                <Target />
                {getCategory(session.category).name} focus
              </h2>
              {Object.entries(a.mode_metrics).map(([name, value]) => (
                <Progress
                  key={name}
                  label={name}
                  value={value}
                  display={value}
                />
              ))}
              <p className="muted-note">
                Text-based indicators for this practice mode. Listen to your
                recording for pacing and delivery.
              </p>
            </Card>
          )}
          <Card>
            <Eyebrow>KEEP YOUR MOMENTUM</Eyebrow>
            <h3 style={{ fontSize: 16, marginTop: 14, lineHeight: 1.6 }}>
              Same question.
              <br />A fresh approach.
            </h3>
            <p className="muted-note">
              Repeat this prompt once with your coach’s technique. Notice how
              your answer changes.
            </p>
            <Link
              href={retry}
              className="text-link"
              style={{ fontSize: 10, marginTop: 17 }}
            >
              Take another turn <ArrowRight size={13} />
            </Link>
          </Card>
        </div>
      </div>
      <Card className="transcript-panel">
        <CardHeader
          action={<Badge>{a.words} words</Badge>}
        >
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} />
              Your complete transcript
            </h2>
            <p>Your words, with a few patterns brought into focus.</p>
          </div>
        </CardHeader>
        <p className="transcript-text">
          {pieces.map((piece, i) =>
            i % 2 === 1 ? (
              <mark key={i}>{piece}</mark>
            ) : (
              <span key={i}>{piece}</span>
            ),
          )}
        </p>
        {session.entities && session.entities.length > 0 && (
          <div className="entity-list">
            <strong>Names & terms we heard</strong>
            <ul>
              {session.entities.map((e) => (
                <li key={`${e.type}-${e.text}`}>
                  <span>{e.type.replace(/_/g, " ")}</span>
                  {e.text}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="transcript-legend">
          <span>
            <i className="legend-dot" />
            Possible filler word · review in context
          </span>
          <span>Long pauses require audio-based analysis.</span>
        </div>
      </Card>
      <div className="results-actions">
        <ButtonLink href={retry}>
          Practice Again <Mic size={15} />
        </ButtonLink>
        <ButtonLink href="/progress" secondary>
          View Progress <ArrowRight size={15} />
        </ButtonLink>
      </div>
    </>
  );
}
