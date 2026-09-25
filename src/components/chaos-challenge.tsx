"use client";
import { Zap, ArrowRight, Check, Clock3 } from "lucide-react";
import { useVocalis } from "@/hooks/use-vocalis";
import { getChaosChallenge, CHAOS_CHALLENGE } from "@/data/rewards";
import { ButtonLink } from "./ui";
export default function ChaosChallenge() {
  const { data } = useVocalis();
  const { done, complete } = getChaosChallenge(data.sessions);
  const minutes = CHAOS_CHALLENGE.minSeconds / 60;
  return (
    <section
      className={`mode-banner chaos-challenge ${complete ? "complete" : ""}`}
    >
      <div>
        <span className="chaos-tag">
          {complete ? (
            <>
              <Check size={11} />
              Claimed today · back tomorrow
            </>
          ) : (
            <>
              <Zap size={11} fill="currentColor" />
              Daily chaos challenge · +{CHAOS_CHALLENGE.bonus} pts
            </>
          )}
        </span>
        <h2>
          <Zap size={24} />A little chaos. A lot of possibility.
        </h2>
        <p>
          {complete
            ? `You beat today’s challenge and earned ${CHAOS_CHALLENGE.bonus} points. Keep going for +50 per chaotic session.`
            : `Finish ${CHAOS_CHALLENGE.attempts} Chaotic sessions of ${minutes}+ minutes today to earn ${CHAOS_CHALLENGE.bonus} bonus points. Once a day.`}
        </p>
        <div
          className="chaos-attempts"
          role="progressbar"
          aria-label="Chaos challenge attempts today"
          aria-valuemin={0}
          aria-valuemax={CHAOS_CHALLENGE.attempts}
          aria-valuenow={done}
        >
          {Array.from({ length: CHAOS_CHALLENGE.attempts }, (_, i) => (
            <span
              key={i}
              className={
                i < done ? "done" : i === done && !complete ? "next" : ""
              }
            >
              {i < done ? <Check size={12} /> : <Clock3 size={11} />}
              {minutes} min
            </span>
          ))}
          <b>
            {done}/{CHAOS_CHALLENGE.attempts}
          </b>
        </div>
      </div>
      <ButtonLink
        href={`/practice/chaotic?length=${CHAOS_CHALLENGE.minSeconds}`}
      >
        {complete
          ? "Enter Chaotic Mode"
          : done
            ? `Attempt ${done + 1} of ${CHAOS_CHALLENGE.attempts}`
            : "Start the challenge"}{" "}
        <ArrowRight size={15} />
      </ButtonLink>
    </section>
  );
}
