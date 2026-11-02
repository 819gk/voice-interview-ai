import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ScoreRing from '../components/ScoreRing.jsx';
import Spinner from '../components/Spinner.jsx';
import VerdictBadge from '../components/VerdictBadge.jsx';

const gradeFor = (score) =>
  score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs more practice';

export default function Result() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getInterview(id)
      .then(setInterview)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-3 text-rose-300">
        {error}
      </p>
    );
  }

  if (!interview) return <Spinner label="Loading results..." />;

  if (interview.status !== 'completed') {
    return (
      <div className="rounded-2xl border border-slate-800 p-8 text-center text-slate-300">
        This interview is not finished yet.{' '}
        <Link to={`/interview/${id}`} className="font-medium text-indigo-400 hover:text-indigo-300">
          Continue interview
        </Link>
      </div>
    );
  }

  const { summary } = interview;

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center sm:flex-row sm:text-left">
        <ScoreRing score={interview.totalScore} />
        <div className="flex-1">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            {interview.technology} · <span className="capitalize">{interview.level}</span>
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{gradeFor(interview.totalScore)}</h1>
          {summary?.overall && <p className="mt-3 text-slate-300">{summary.overall}</p>}
        </div>
      </section>

      {(summary?.strengths?.length > 0 || summary?.improvements?.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {summary.strengths.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h2 className="mb-2 font-semibold text-emerald-300">Strengths</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {summary.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.improvements.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h2 className="mb-2 font-semibold text-amber-300">Work on</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {summary.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Question by question</h2>
        {interview.questions.map((q, index) => (
          <article key={q.id} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="flex-1 font-medium text-white">
                <span className="mr-2 text-slate-500">Q{index + 1}.</span>
                {q.text}
              </h3>
              <VerdictBadge verdict={q.verdict} score={q.score} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your answer</p>
              <p className="mt-1 text-sm text-slate-300">{q.userAnswer || <em className="text-slate-500">Skipped</em>}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feedback</p>
              <p className="mt-1 text-sm text-slate-300">{q.feedback}</p>
            </div>
            <div className="rounded-lg bg-indigo-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Correct answer</p>
              <p className="mt-1 text-sm text-slate-200">{q.correctAnswer}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400">
          Start another interview
        </Link>
        <Link to="/history" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500">
          View history
        </Link>
      </div>
    </div>
  );
}
