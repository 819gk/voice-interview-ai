import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Loading..." fullScreen />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}
