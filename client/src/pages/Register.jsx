import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { Field } from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Practise real interviews with an AI that talks and listens."
      error={error}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" autoComplete="name" required minLength={2} value={form.name} onChange={update('name')} placeholder="Gulshan Kumar" />
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
        <Field label="Password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={form.password} onChange={update('password')} placeholder="At least 8 characters" />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-500 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
