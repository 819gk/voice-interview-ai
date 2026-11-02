import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

export function Field({ label, error, ...props }) {
  const inputId = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = props.type === 'password';

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={isPassword && passwordVisible ? 'text' : props.type}
          className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
            isPassword ? 'pr-12' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-400"
          >
            {passwordVisible ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 8.5 4.5 9.5 6.2a1.5 1.5 0 010 1.6 14 14 0 01-3.1 3.5M6.2 6.2a14 14 0 00-3.7 5 1.5 1.5 0 000 1.6C3.5 14.5 6.8 19 12 19c1.2 0 2.3-.3 3.3-.7" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </div>
  );
}

export default function AuthShell({ title, subtitle, error, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <Link to="/login" className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-white sm:text-2xl">
          <span aria-hidden="true">🎙️</span> VoiceInterview AI
        </Link>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-400">{subtitle}</p>
          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>
      </div>
    </div>
  );
}
