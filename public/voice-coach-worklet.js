// Captures microphone audio, downsamples it to 24 kHz and posts 16-bit PCM chunks (~50 ms each)
// for the AssemblyAI Voice Agent API.
const TARGET_RATE = 24000;
const CHUNK = 1200;
class VoiceCoachCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / TARGET_RATE;
    this.position = 0;
    this.buffer = new Int16Array(CHUNK);
    this.length = 0;
  }
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input) return true;
    while (this.position < input.length) {
      const sample = Math.max(-1, Math.min(1, input[Math.floor(this.position)]));
      this.buffer[this.length++] = sample < 0 ? sample * 32768 : sample * 32767;
      if (this.length === CHUNK) {
        this.port.postMessage(this.buffer.buffer, [this.buffer.buffer]);
        this.buffer = new Int16Array(CHUNK);
        this.length = 0;
      }
      this.position += this.ratio;
    }
    this.position -= input.length;
    return true;
  }
}
registerProcessor("voice-coach-capture", VoiceCoachCapture);
