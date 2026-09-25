export class AudioRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  async start() {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    )
      throw new Error(
        "Microphone recording is not supported in this browser. Try Chrome or Edge, paste a transcript, or use the demo.",
      );
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    try {
      this.chunks = [];
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.ondataavailable = (e) => {
        if (e.data.size) this.chunks.push(e.data);
      };
      this.recorder.start(250);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder || this.recorder.state === "inactive") {
        resolve(new Blob(this.chunks));
        return;
      }
      const mime = this.recorder.mimeType;
      this.recorder.onstop = () => {
        this.stream?.getTracks().forEach((t) => t.stop());
        resolve(new Blob(this.chunks, { type: mime }));
      };
      this.recorder.stop();
    });
  }
  dispose() {
    if (this.recorder?.state === "recording") this.recorder.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
  }
}
