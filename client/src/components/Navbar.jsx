import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link to="/" className="mr-auto flex items-center gap-2 whitespace-nowrap text-sm font-bold text-white sm:mr-0 sm:text-lg">
          <span aria-hidden="true">🎙️</span> VoiceInterview AI
        </Link>

        <nav className="order-3 flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto">
          <NavLink to="/" end className={linkClass}>
            New interview
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
