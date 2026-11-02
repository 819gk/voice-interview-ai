import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function History() {
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listInterviews()
      .then((data) => setInterviews(data.interviews))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-rose-500/10 px-4 py-3 text-rose-300">
        {error}
      </p>
    );
  }

  if (!interviews) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Interview history</h1>

      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No interviews yet.{' '}
          <Link to="/" className="font-medium text-indigo-400 hover:text-indigo-300">
            Start your first one
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {interviews.map((item) => {
            const done = item.status === 'completed';
            return (
              <li key={item.id}>
                <Link
                  to={done ? `/results/${item.id}` : `/interview/${item.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4 transition hover:border-slate-600"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {item.technology} <span className="font-normal capitalize text-slate-400">· {item.level}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(item.createdAt)} · {item.totalQuestions} questions
                    </p>
                  </div>
                  {done ? (
                    <span className="text-2xl font-bold text-indigo-300">
                      {item.totalScore}
                      <span className="text-sm font-normal text-slate-500">/100</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                      Continue ({item.currentIndex}/{item.totalQuestions})
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
