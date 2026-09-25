'use client';
import { useEffect, useRef, useState } from 'react';
import { Headphones, PhoneOff, RotateCw, Wand2, Mic, AlertCircle, Check, X } from 'lucide-react';
import { Technique } from '@/types';
const WS_URL = 'wss://agents.assemblyai.com/v1/ws';
const OUTPUT_RATE = 24000;
type Status = 'idle' | 'connecting' | 'live' | 'ended' | 'error';
interface Line { who: 'coach' | 'you'; text: string; }
// Text sent straight to TTS must be plain words; strip anything that would be read out literally.
const plain = (text: string) => text.replace(/[*_#`>|[\]{}<>]/g, '').replace(/\s+/g, ' ').trim();
const ordinals = ['one', 'two', 'three', 'four', 'five'];
function buildGreeting(techniques: Technique[]) {
 const parts = techniques.slice(0, 3).map((t, i) => `Technique ${ordinals[i]}: ${plain(t.name)}. ${plain(t.action)}`);
 return plain(`Hi, I'm your Vocalis voice coach. Here are your small techniques for a big difference. ${parts.join(' ')} Would you like me to say your speech in a better way, using these techniques? Tap yes or no below.`);
}
function buildPrompt({ topic, transcript, techniques, feedback }: { topic: string; transcript: string; techniques: Technique[]; feedback: string }) {
 const list = techniques.map((t, i) => `${i + 1}. ${plain(t.name)} (${plain(t.weakness)}). Why: ${plain(t.why)} Do: ${plain(t.action)} Practice: ${plain(t.practice)}`).join('\n');
 return `You are the Vocalis voice coach, a warm and encouraging public speaking coach on a voice call.
Everything you say is spoken aloud: use plain sentences only, no lists, symbols, headings or formatting.
Keep normal replies to one to three short sentences.

The speaker practiced this topic: "${plain(topic)}"
What they said (their transcript):
"""${transcript.slice(0, 6000)}"""

Written coaching they received: ${plain(feedback)}
Their techniques:
${list}

What you do:
- If they want to hear their speech said better, deliver an improved version of THEIR speech in the first person, as if you were them. Keep their ideas, stories and meaning; do not invent facts. Apply the techniques above, give it a clear opening, structure and ending, and use no filler words. Keep it about the same length as theirs and under 90 seconds. Say it straight away, with no preamble, then ask in one sentence which part they would like to try themselves.
- If they ask to hear the techniques again, explain them simply, one at a time.
- If they ask why a change works, explain it briefly using the technique it came from.
- If they go off topic, gently bring them back to their speech.`;
}
export default function VoiceCoach({ topic, transcript, techniques, feedback }: { topic: string; transcript: string; techniques: Technique[]; feedback: string }) {
 const [status, setStatus] = useState<Status>('idle');
 const [error, setError] = useState('');
 const [lines, setLines] = useState<Line[]>([]);
 const [speaking, setSpeaking] = useState(false);
 // The greeting ends with a yes/no question; answer buttons show once it has been spoken.
 const [offer, setOffer] = useState<'pending' | 'open' | 'answered'>('pending');
 const ws = useRef<WebSocket | null>(null);
 const ctx = useRef<AudioContext | null>(null);
 const stream = useRef<MediaStream | null>(null);
 const sources = useRef<AudioBufferSourceNode[]>([]);
 const playhead = useRef(0);
 const logEnd = useRef<HTMLDivElement | null>(null);
 useEffect(() => { logEnd.current?.scrollIntoView({ block: 'nearest' }); }, [lines]);
 useEffect(() => () => teardown(), []);
 function flushAudio() { for (const s of sources.current) { try { s.stop(); } catch {} } sources.current = []; playhead.current = ctx.current?.currentTime || 0; setSpeaking(false); }
 function teardown() {
  const socket = ws.current; ws.current = null;
  if (socket) { try { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'session.end' })); socket.close(); } catch {} }
  flushAudio();
  stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
  ctx.current?.close().catch(() => {}); ctx.current = null;
 }
 function play(base64: string) {
  const audio = ctx.current; if (!audio) return;
  const raw = atob(base64); const samples = new Float32Array(raw.length >> 1);
  for (let i = 0; i < samples.length; i++) { let v = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8); if (v >= 32768) v -= 65536; samples[i] = v / 32768; }
  const buffer = audio.createBuffer(1, samples.length, OUTPUT_RATE); buffer.getChannelData(0).set(samples);
  const src = audio.createBufferSource(); src.buffer = buffer; src.connect(audio.destination);
  const start = Math.max(playhead.current, audio.currentTime); src.start(start); playhead.current = start + buffer.duration;
  sources.current.push(src); setSpeaking(true);
  src.onended = () => { sources.current = sources.current.filter(s => s !== src); if (!sources.current.length) setSpeaking(false); };
 }
 function addLine(who: Line['who'], text: string) { if (text.trim()) setLines(l => [...l, { who, text: text.trim() }]); }
 async function start() {
  setError(''); setLines([]); setOffer('pending'); setStatus('connecting');
  try {
   const audio = new AudioContext(); ctx.current = audio; playhead.current = audio.currentTime;
   const [mic, tokenResponse] = await Promise.all([
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } }),
    fetch('/api/voice-token', { cache: 'no-store' }),
   ]);
   stream.current = mic;
   const body = await tokenResponse.json();
   if (!tokenResponse.ok || !body.token) throw new Error(body.error || 'The voice coach is unavailable right now.');
   await audio.audioWorklet.addModule('/voice-coach-worklet.js');
   const capture = new AudioWorkletNode(audio, 'voice-coach-capture');
   audio.createMediaStreamSource(mic).connect(capture).connect(audio.destination);
   const url = new URL(WS_URL); url.searchParams.set('token', body.token);
   const socket = new WebSocket(url); ws.current = socket;
   let ready = false;
   capture.port.onmessage = e => {
    if (!ready || socket.readyState !== WebSocket.OPEN) return;
    const bytes = new Uint8Array(e.data as ArrayBuffer); let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    socket.send(JSON.stringify({ type: 'input.audio', audio: btoa(binary) }));
   };
   socket.onopen = () => socket.send(JSON.stringify({ type: 'session.update', session: { system_prompt: buildPrompt({ topic, transcript, techniques, feedback }), greeting: buildGreeting(techniques), output: { voice: 'anna' } } }));
   socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'session.ready') { ready = true; setStatus('live'); }
    else if (msg.type === 'reply.audio') play(msg.data);
    else if (msg.type === 'reply.done' && msg.status === 'interrupted') flushAudio();
    else if (msg.type === 'transcript.agent') { addLine('coach', msg.text || ''); setOffer(o => o === 'pending' ? 'open' : o); }
    else if (msg.type === 'transcript.user') { addLine('you', msg.text || ''); setOffer('answered'); }
    else if (msg.type === 'session.error' || msg.type === 'error') { setError(msg.message || 'The voice coach hit a problem.'); }
   };
   socket.onclose = () => { if (ws.current === socket) { teardown(); setStatus(s => s === 'error' ? s : 'ended'); } };
   socket.onerror = () => { setError('Lost connection to the voice coach.'); setStatus('error'); };
  } catch (e) {
   teardown();
   const denied = e instanceof DOMException && e.name === 'NotAllowedError';
   setError(denied ? 'Microphone access was denied. Allow it in your browser’s site settings to talk with your coach.' : e instanceof Error ? e.message : 'Could not start the voice coach.');
   setStatus('error');
  }
 }
 function ask(instructions: string) { if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: 'reply.create', instructions })); }
 function answer(yes: boolean) {
  setOffer('answered'); addLine('you', yes ? 'Yes, say my speech better.' : 'No, thanks.');
  ask(yes ? 'The user tapped yes. Say their speech in a better way now, following your instructions for the improved version.' : 'The user tapped no. Acknowledge it in one short sentence and ask if they have any questions about their techniques.');
 }
 function stop() { teardown(); setStatus('ended'); }
 const live = status === 'live';
 return <div className={`voice-coach ${live ? 'live' : ''}`}>
  <div className="voice-coach-head"><span className={`voice-coach-orb ${speaking ? 'speaking' : ''}`}><Headphones size={18} /></span><div><strong>Voice coach</strong><small>{live ? speaking ? 'Your coach is speaking… talk any time to interrupt.' : offer === 'open' ? 'Tap yes to hear your speech said better, or ask a question.' : 'Listening. Ask a question any time.' : status === 'connecting' ? 'Connecting to your coach…' : 'Hear these techniques read aloud, then hear your own speech said a better way.'}</small></div>
   {live ? <button className="voice-coach-end" onClick={stop}><PhoneOff size={13} />End</button> : <button className="voice-coach-start" onClick={start} disabled={status === 'connecting'}><Mic size={13} />{status === 'connecting' ? 'Connecting…' : status === 'idle' ? 'Talk with your coach' : 'Talk again'}</button>}
  </div>
  {live && offer === 'open' && <div className="voice-coach-offer" role="group" aria-label="Answer your coach"><span>Would you like me to say your speech in a better way?</span><div><button className="yes" onClick={() => answer(true)}><Check size={13} />Yes, say it better</button><button onClick={() => answer(false)}><X size={13} />No, thanks</button></div></div>}
  {live && offer === 'answered' && <div className="voice-coach-actions"><button onClick={() => ask('Say the user’s speech in a better way now, following your instructions for the improved version.')}><Wand2 size={12} />Say my speech better</button><button onClick={() => ask('Read the user’s techniques again, one at a time, simply and briefly.')}><RotateCw size={12} />Read techniques again</button></div>}
  {error && <p className="voice-coach-error" role="alert"><AlertCircle size={13} />{error}</p>}
  {lines.length > 0 && <div className="voice-coach-log" aria-live="polite">{lines.map((l, i) => <p key={i} className={l.who}><b>{l.who === 'coach' ? 'Coach' : 'You'}</b>{l.text}</p>)}<div ref={logEnd} /></div>}
  {status === 'idle' && <p className="voice-coach-note">Uses your microphone. Your transcript and techniques are shared with AssemblyAI’s voice agent for this conversation. Sessions end after 10 minutes.</p>}
 </div>;
}
