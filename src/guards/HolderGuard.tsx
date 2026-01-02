import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

export function HolderGuard({ children }: { children: JSX.Element }) {
  const { currentHolder } = useAppStore();

  if (!currentHolder) {
    return <Navigate to="/login" replace />;
  }

  return children;
}