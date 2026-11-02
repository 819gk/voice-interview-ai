import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import VerdictBadge from '../components/VerdictBadge.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';

const VERDICT_INTRO = {
  correct: 'That is correct.',
  partial: 'That is partially correct.',
  incorrect: 'That is not correct.',
};

const buildFeedbackSpeech = (evaluation) =>
  `${VERDICT_INTRO[evaluation.verdict]} ${evaluation.feedback} The correct answer is: ${evaluation.correctAnswer}`;

/*
 * Interview phases:
 *  loading    -> fetching the interview
 *  ready      -> waiting for the user's first click (browsers need a gesture before audio)
 *  speaking   -> the AI reads the question aloud
 *  answering  -> microphone is open / the user can type
 *  evaluating -> answer sent to the AI
 *  feedback   -> verdict + correct answer shown and read aloud
 */
export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lang = localStorage.getItem('vi_lang') || 'en-IN';

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  const [phase, setPhase] = useState('loading');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const phaseRef = useRef(phase);
  const answerRef = useRef('');
  const tts = useSpeechSynthesis();

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const updateAnswer = useCallback((value) => {
    answerRef.current = value;
    setAnswer(value);
  }, []);

  const appendSpeech = useCallback(
    (chunk) => updateAnswer(`${answerRef.current} ${chunk}`.trim()),
    [updateAnswer],
  );

  const stt = useSpeechRecognition({ lang, onFinal: appendSpeech });

  useEffect(() => {
    let cancelled = false;

    api
      .getInterview(id)
      .then((data) => {
        if (cancelled) return;
        if (data.status === 'completed') {
          navigate(`/results/${id}`, { replace: true });
          return;
        }
        setInterview(data);
        setQuestion(data.currentQuestion);
        setProgress({ answered: data.currentIndex, total: data.totalQuestions });
        setPhase('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setPhase('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const askQuestion = useCallback(
    async (target) => {
      setError('');
      // Close the microphone first so the AI's own voice is never transcribed as the answer.
      await stt.stop();
      setPhase('speaking');
      await tts.speak(target.text, { lang });

      // The user may have skipped ahead while the question was being read.
      if (phaseRef.current === 'speaking') {
        setPhase('answering');
        if (stt.supported) stt.start();
      }
    },
    [tts, lang, stt],
  );

  const skipToAnswering = () => {
    tts.cancel();
    setPhase('answering');
  };

  const toggleMic = () => {
    if (stt.listening) {
      stt.stop();
    } else {
      tts.cancel();
      stt.start();
    }
  };

  async function submit(skipped = false) {
    if (phase === 'evaluating') return;

    setError('');
    tts.cancel();
    await stt.stop();
    setPhase('evaluating');

    try {
      const result = await api.submitAnswer(id, skipped ? '' : answerRef.current.trim());
      setEvaluation(result.evaluation);
      setCompleted(result.completed);
      setNextQuestion(result.nextQuestion);
      setProgress(result.progress);
      setPhase('feedback');
      await tts.speak(buildFeedbackSpeech(result.evaluation), { lang });
    } catch (err) {
      setError(err.message);
      setPhase('answering');
    }
  }

  function goNext() {
    if (completed) {
      navigate(`/results/${id}`);
      return;
    }

    tts.cancel();
    setQuestion(nextQuestion);
    setNextQuestion(null);
    setEvaluation(null);
    updateAnswer('');
    askQuestion(nextQuestion);
  }

  if (phase === 'loading') return <Spinner label="Loading interview..." />;

  if (phase === 'error') {
    return (
      <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-3 text-rose-300">
        {error}
      </p>
    );
  }

  const number = Math.min(progress.answered + (phase === 'feedback' ? 0 : 1), progress.total);
  const percent = Math.round((progress.answered / progress.total) * 100);
  const canEdit = phase === 'answering';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>
            {interview.technology} · <span className="capitalize">{interview.level}</span>
          </span>
          <span>
            Question {number} of {progress.total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {!stt.supported && (
        <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Voice input is not supported in this browser. Use Chrome or Edge for speech, or type your answers below.
        </p>
      )}

      {/* AI interviewer */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-2xl ${
              tts.speaking ? 'animate-pulse ring-2 ring-indigo-400' : ''
            }`}
            aria-hidden="true"
          >
            🤖
          </span>
          <div>
            <p className="font-semibold text-white">AI Interviewer</p>
            <p className="text-xs text-slate-400">{tts.speaking ? 'Speaking...' : 'Waiting for you'}</p>
          </div>
        </div>

        <p className="text-xl leading-relaxed text-white">{question?.text}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {phase === 'ready' && (
            <button
              onClick={() => askQuestion(question)}
              className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              🔊 {progress.answered > 0 ? 'Resume interview' : 'Start interview'}
            </button>
          )}
          {phase === 'speaking' && (
            <button onClick={skipToAnswering} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">
              Skip reading, answer now
            </button>
          )}
          {phase === 'answering' && (
            <button
              onClick={() => askQuestion(question)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              🔁 Repeat question
            </button>
          )}
        </div>
      </section>

      {/* Candidate answer */}
      {phase !== 'ready' && phase !== 'speaking' && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Your answer</h2>
            {stt.listening && (
              <span className="flex items-center gap-2 text-sm text-rose-300">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" /> Listening...
              </span>
            )}
          </div>

          <textarea
            value={answer}
            onChange={(event) => updateAnswer(event.target.value)}
            readOnly={!canEdit}
            rows={5}
            maxLength={3000}
            placeholder={stt.supported ? 'Click the microphone and speak, or type your answer here...' : 'Type your answer here...'}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 placeholder-slate-500 read-only:opacity-80"
          />
          {stt.interim && <p className="mt-2 text-sm italic text-slate-500">{stt.interim}</p>}
          {stt.error && <p className="mt-2 text-sm text-amber-300">{stt.error}</p>}

          {canEdit && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {stt.supported && (
                <button
                  onClick={toggleMic}
                  className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                    stt.listening ? 'bg-rose-500 hover:bg-rose-400' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {stt.listening ? '⏹ Stop recording' : '🎤 Start speaking'}
                </button>
              )}
              <button
                onClick={() => submit(false)}
                disabled={!answer.trim()}
                className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit answer
              </button>
              <button onClick={() => submit(true)} className="px-3 py-3 text-sm text-slate-400 hover:text-white">
                I don't know / skip
              </button>
            </div>
          )}

          {phase === 'evaluating' && <Spinner label="The AI is reviewing your answer..." />}
          {error && phase === 'answering' && (
            <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </section>
      )}

      {/* AI feedback */}
      {phase === 'feedback' && evaluation && (
        <section className="space-y-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-white">AI feedback</h2>
            <VerdictBadge verdict={evaluation.verdict} score={evaluation.score} />
          </div>
          <p className="text-slate-200">{evaluation.feedback}</p>
          <div className="rounded-xl bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Correct answer</p>
            <p className="mt-1 text-slate-200">{evaluation.correctAnswer}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={goNext}
              className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              {completed ? 'See my score →' : 'Next question →'}
            </button>
            <button
              onClick={() => tts.speak(buildFeedbackSpeech(evaluation), { lang })}
              className="rounded-xl border border-slate-700 px-5 py-3 text-slate-200 hover:border-slate-500"
            >
              🔁 Hear again
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
