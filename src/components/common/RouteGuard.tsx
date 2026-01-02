// src/components/common/RouteGuard.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Public yo'llar (login talab qilinmaydi)
const PUBLIC_ROUTES = ['/login', '/403', '/404'];

// Role-based yo'l patternlari
const ADMIN_ROUTES = ['/admin/*'];
const HOLDER_ROUTES = ['/holder/*'];

function patternMosKeladimi(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    const publicYoilmi = patternMosKeladimi(currentPath, PUBLIC_ROUTES);

    // Agar foydalanuvchi login qilmagan bo'lsa va yo'l public bo'lmasa
    if (!user && !publicYoilmi) {
      navigate('/login', { 
        state: { from: location.pathname }, 
        replace: true 
      });
      return;
    }

    // Agar foydalanuvchi login qilgan bo'lsa
    if (user && profile) {
      // Agar login sahifasida bo'lsa, dashboardga yo'naltir
      if (currentPath === '/login') {
        if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (profile.role === 'holder') {
          navigate('/holder/dashboard', { replace: true });
        }
        return;
      }

      // Role-based access control (Ruxsatni tekshirish)
      const adminYoilmi = patternMosKeladimi(currentPath, ADMIN_ROUTES);
      const holderYoilmi = patternMosKeladimi(currentPath, HOLDER_ROUTES);

      if (adminYoilmi && profile.role !== 'admin') {
        // Admin yo'lida, lekin admin emas
        if (profile.role === 'holder') {
          navigate('/holder/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      if (holderYoilmi && profile.role !== 'holder') {
        // Holder yo'lida, lekin holder emas
        if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}