import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import { cleanCustomWords } from "@/data/custom-words";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 60000;
export async function POST(request: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Server-side transcription is not configured." },
      { status: 501 },
    );
  let audio: Blob;
  let topic = "";
  let keyterms: string[] = [];
  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob) || !file.size)
      return NextResponse.json(
        { error: "No audio was received." },
        { status: 400 },
      );
    if (file.size > MAX_AUDIO_BYTES)
      return NextResponse.json(
        { error: "This recording is too large to transcribe." },
        { status: 400 },
      );
    audio = file;
    const topicField = form.get("topic");
    if (typeof topicField === "string") topic = topicField.slice(0, 300);
    const keytermsField = form.get("keyterms");
    if (typeof keytermsField === "string" && keytermsField.length < 20000) {
      try {
        keyterms = cleanCustomWords(JSON.parse(keytermsField));
      } catch {
        keyterms = [];
      }
    }
  } catch {
    return NextResponse.json(
      { error: "The recording could not be read." },
      { status: 400 },
    );
  }
  try {
    const client = new AssemblyAI({ apiKey });
    const buffer = Buffer.from(await audio.arrayBuffer());
    const transcript = await Promise.race([
      client.transcripts.transcribe({
        audio: buffer,
        // Vocalis supports English. Pinning it keeps transcripts on Universal-3.5 Pro; auto-detection can
        // misread short or quiet clips as another language and fall back to a model that invents words.
        language_code: "en",
        // Reject recordings that are mostly silence instead of returning made-up text.
        speech_threshold: 0.1,
        speaker_labels: true,
        format_text: true,
        // Keep "um", "uh" and other hesitations; AssemblyAI removes them by default and analysis needs them.
        disfluencies: true,
        // Entity detection: names, organizations, places and other entities mentioned in the speech.
        entity_detection: true,

        // Contextual prompting: the practice topic helps the model recognize topic-specific words correctly.
        ...(topic
          ? {
              prompt: `A person practicing a spoken response to this prompt: "${topic}"`,
            }
          : {}),
        // Keyterms prompting: the speaker's custom words (names, project names, jargon).
        ...(keyterms.length ? { keyterms_prompt: keyterms } : {}),
      },
      // The SDK checks for a finished transcript every 3 s by default; check every 0.5 s instead.
      { pollingInterval: 500, pollingTimeout: TIMEOUT_MS }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Transcription is taking longer than expected. Please try again.",
              ),
            ),
          TIMEOUT_MS,
        ),
      ),
    ]);
    if (transcript.status === "error")
      return NextResponse.json(
        {
          error: /speech/i.test(transcript.error || "")
            ? "We couldn’t hear enough speech in this recording. Check your microphone and try again, or type your transcript below."
            : transcript.error || "Transcription failed.",
        },
        { status: 502 },
      );
    const speakerCount = new Set(
      (transcript.utterances || []).map((u) => u.speaker),
    ).size;
    return NextResponse.json({
      id: transcript.id,
      text: transcript.text || "",
      language_code: transcript.language_code || null,
      language_confidence: transcript.language_confidence,
      utterances:
        speakerCount > 1
          ? transcript.utterances!.map((u) => ({
              speaker: u.speaker,
              text: u.text,
              start: u.start,
              end: u.end,
            }))
          : null,
      entities: (transcript.entities || []).map((e) => ({
        type: e.entity_type,
        text: e.text,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Transcription failed. Your recording is safe—please try again.",
      },
      { status: 502 },
    );
  }
}
