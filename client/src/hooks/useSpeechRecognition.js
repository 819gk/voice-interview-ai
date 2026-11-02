import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow the microphone in your browser settings and try again.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection (Chrome sends audio to Google for transcription).',
};

/**
 * Wraps the browser Web Speech API.
 * `onFinal(text)` is called for every finished phrase; `interim` holds the phrase being spoken.
 */
export function useSpeechRecognition({ lang = 'en-IN', onFinal } = {}) {
  const recognitionRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  const waitersRef = useRef([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalRef.current?.(text.trim());
        } else {
          interimText += text;
        }
      }
      setInterim(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(ERROR_MESSAGES[event.error] ?? `Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim('');
      waitersRef.current.forEach((resolve) => resolve());
      waitersRef.current = [];
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }
  }, [lang]);

  // Resolves once the engine has delivered its last result, so no words are lost on submit.
  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        if (!recognitionRef.current) {
          resolve();
          return;
        }
        waitersRef.current.push(resolve);
        recognitionRef.current.stop();
        setTimeout(resolve, 1500);
      }),
    [],
  );

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
    },
    [],
  );

  return { supported: Boolean(SpeechRecognitionImpl), listening, interim, error, start, stop };
}
