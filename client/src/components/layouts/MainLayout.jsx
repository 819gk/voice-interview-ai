import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import Spinner from '../Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MainLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Loading your session..." fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </>
  );
}
