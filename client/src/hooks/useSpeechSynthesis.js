import { useCallback, useEffect, useRef, useState } from 'react';

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Chrome silently stops long utterances, so text is spoken in sentence-sized chunks.
function splitIntoChunks(text, maxLength = 180) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  const language = lang.split('-')[0];
  return (
    voices.find((voice) => voice.lang === lang) ||
    voices.find((voice) => voice.lang.startsWith(language)) ||
    null
  );
}

function speakChunk(text, lang, rate) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

export function useSpeechSynthesis() {
  const runRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);

  const cancel = useCallback(() => {
    runRef.current += 1;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text, { lang = 'en-IN', rate = 1 } = {}) => {
    if (!supported || !text) return;

    runRef.current += 1;
    const runId = runRef.current;
    window.speechSynthesis.cancel();
    setSpeaking(true);

    for (const chunk of splitIntoChunks(text)) {
      if (runRef.current !== runId) return;
      await speakChunk(chunk, lang, rate);
    }

    if (runRef.current === runId) setSpeaking(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  return { supported, speaking, speak, cancel };
}
