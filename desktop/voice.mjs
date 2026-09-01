export function createVoiceCompanion({ onTranscript, onState } = {}) {
  const Recognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition;
  if (!Recognition) {
    onState?.('unavailable');
    return { available: false, start() {}, stop() {}, speak() {}, cancel() {} };
  }

  const recognition = new Recognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onState?.('listening');
  recognition.onend = () => onState?.('idle');
  recognition.onerror = () => onState?.('error');
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript?.trim();
    if (text) onTranscript?.(text);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in globalThis) || !text?.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.98;
    utterance.pitch = 1.06;
    utterance.volume = 1;
    utterance.onstart = () => onState?.('speaking');
    utterance.onend = () => onState?.('idle');
    utterance.onerror = () => onState?.('error');
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  return {
    available: true,
    start() { try { recognition.start(); } catch { /* already listening */ } },
    stop() { try { recognition.stop(); } catch { /* already stopped */ } },
    speak,
    cancel() { speechSynthesis?.cancel?.(); },
  };
}
