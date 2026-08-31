export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface SpeechRecognitionResult {
  readonly text: string;
  readonly confidence?: number;
  readonly isFinal: boolean;
}

export interface SpeechRecognizer {
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  onResult(handler: (result: SpeechRecognitionResult) => void): () => void;
  onError(handler: (error: Error) => void): () => void;
}

export interface SpeechSynthesizer {
  speak(text: string): void | Promise<void>;
  stop(): void | Promise<void>;
}
