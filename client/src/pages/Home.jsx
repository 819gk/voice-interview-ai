import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const ACCENTS = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-AU', label: 'English (Australia)' },
];

const LANG_KEY = 'vi_lang';

function Choice({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? 'border-indigo-400 bg-indigo-500/15 text-white'
          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [level, setLevel] = useState('intermediate');
  const [technology, setTechnology] = useState('React');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en-IN');
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api
      .options()
      .then(setOptions)
      .catch((err) => setError(err.message));
  }, []);

  async function handleStart() {
    setError('');
    setStarting(true);
    localStorage.setItem(LANG_KEY, lang);

    try {
      const interview = await api.createInterview({ technology, level, totalQuestions });
      navigate(`/interview/${interview.id}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  if (!options) {
    return error ? (
      <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-3 text-rose-300">
        {error}
      </p>
    ) : (
      <Spinner />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Hi {user?.name?.split(' ')[0]}, ready to practise?</h1>
        <p className="mt-2 text-slate-400">
          Choose your level and technology. The AI interviewer will ask you questions out loud and listen to your spoken answers.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">1. Your level</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.levels.map((item) => (
            <Choice key={item.value} selected={level === item.value} onClick={() => setLevel(item.value)}>
              <span className="block font-semibold">{item.label}</span>
              <span className="text-xs text-slate-400">{item.hint}</span>
            </Choice>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">2. Technology</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {options.technologies.map((item) => (
            <Choice key={item} selected={technology === item} onClick={() => setTechnology(item)} className="text-center font-medium">
              {item}
            </Choice>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">3. Number of questions</h2>
          <div className="flex gap-3">
            {options.questionCounts.map((count) => (
              <Choice key={count} selected={totalQuestions === count} onClick={() => setTotalQuestions(count)} className="flex-1 text-center font-semibold">
                {count}
              </Choice>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="accent" className="mb-3 block text-sm font-semibold uppercase tracking-wide text-slate-400">
            4. Voice accent
          </label>
          <select
            id="accent"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
          >
            {ACCENTS.map((accent) => (
              <option key={accent.value} value={accent.value}>
                {accent.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <button
        onClick={handleStart}
        disabled={starting}
        className="w-full rounded-xl bg-indigo-500 py-4 text-lg font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
      >
        {starting ? 'Preparing your questions...' : 'Start interview'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Voice input works best in Google Chrome or Microsoft Edge. You can always type your answer instead.
      </p>
    </div>
  );
}
