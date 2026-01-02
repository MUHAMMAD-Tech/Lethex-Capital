import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AdminGuard({ children }: { children: JSX.Element }) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}