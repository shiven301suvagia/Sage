import type { EventBus } from '../assistant/EventBus.js';
import type { SpeechRecognitionResult, SpeechRecognizer, SpeechSynthesizer, VoiceState } from './VoiceContracts.js';

export class VoiceController {
  private state: VoiceState = 'idle';
  private readonly unsubs: Array<() => void> = [];

  constructor(private readonly events: EventBus, private readonly recognizer: SpeechRecognizer, private readonly synthesizer: SpeechSynthesizer) {
    this.unsubs.push(recognizer.onResult((result) => this.handleResult(result)));
    this.unsubs.push(recognizer.onError((error) => this.handleError(error)));
    this.unsubs.push(events.on('assistant.response', (event) => void this.speak(event.payload.text)));
  }

  get voiceState(): VoiceState { return this.state; }

  async startListening(): Promise<void> {
    if (this.state === 'speaking' || this.state === 'listening') return;
    this.state = 'listening';
    try {
      await this.recognizer.start();
    } catch (error) {
      this.state = 'idle';
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (this.state !== 'listening') return;
    try {
      await this.recognizer.stop();
    } finally {
      this.state = 'idle';
    }
  }

  async speak(text: string): Promise<void> {
    if (!text.trim()) return;
    this.state = 'speaking';
    try { await this.synthesizer.speak(text); }
    finally { this.state = 'idle'; }
  }

  async stopSpeaking(): Promise<void> {
    try { await this.synthesizer.stop(); }
    finally { this.state = 'idle'; }
  }

  dispose(): void {
    this.unsubs.splice(0).forEach((unsubscribe) => unsubscribe());
  }

  private handleResult(result: SpeechRecognitionResult): void {
    if (!result.isFinal || !result.text.trim()) return;
    this.state = 'processing';
    this.events.emit({ type: 'user.input', payload: { text: result.text.trim(), timestampMs: Date.now() } });
    this.state = 'idle';
  }

  private handleError(_error: Error): void { this.state = 'idle'; }
}
