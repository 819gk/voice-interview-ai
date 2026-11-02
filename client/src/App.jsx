import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './components/layouts/AuthLayout.jsx';
import MainLayout from './components/layouts/MainLayout.jsx';
import History from './pages/History.jsx';
import Home from './pages/Home.jsx';
import Interview from './pages/Interview.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Result from './pages/Result.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 antialiased **:focus-visible:outline-2 **:focus-visible:outline-offset-2 **:focus-visible:outline-indigo-400">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/interview/:id" element={<Interview />} />
          <Route path="/results/:id" element={<Result />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
