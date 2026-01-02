import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Public yo'llar (login talab qilinmaydi)
const PUBLIC_ROUTES = ['/login', '/403', '/404'];

// Role-based yo'l patternlari
const ADMIN_ROUTES = ['/admin', '/admin/*'];
const HOLDER_ROUTES = ['/holder', '/holder/*'];

function patternMosKeladimi(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path.startsWith(pattern);
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const { currentHolder } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    const publicYoilmi = patternMosKeladimi(currentPath, PUBLIC_ROUTES);

    // Agar foydalanuvchi login qilmagan bo'lsa va yo'l public bo'lmasa
    if (!user && !publicYoilmi) {
      console.log('Login qilmagan foydalanuvchi, login sahifasiga yo\'naltirilmoqda');
      navigate('/login', { 
        state: { from: currentPath }, 
        replace: true 
      });
      return;
    }

    // Agar foydalanuvchi login qilgan bo'lsa
    if (user && profile) {
      console.log('Foydalanuvchi login qilgan. Role:', profile.role);
      console.log('Joriy yo\'l:', currentPath);

      // Agar login sahifasida bo'lsa, role bo'yicha dashboardga yo'naltir
      if (currentPath === '/login' || currentPath === '/') {
        if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (profile.role === 'holder') {
          navigate('/holder/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // Role-based access control (Ruxsatni tekshirish)
      const adminYoilmi = patternMosKeladimi(currentPath, ADMIN_ROUTES);
      const holderYoilmi = patternMosKeladimi(currentPath, HOLDER_ROUTES);

      if (adminYoilmi) {
        if (profile.role !== 'admin') {
          console.log('Admin yo\'lida, lekin admin emas. Role:', profile.role);
          if (profile.role === 'holder') {
            navigate('/holder/dashboard', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
          return;
        }
      }

      if (holderYoilmi) {
        if (profile.role !== 'holder') {
          console.log('Holder yo\'lida, lekin holder emas. Role:', profile.role);
          if (profile.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
          return;
        }
      }

      // Holder uchun qo'shimcha tekshiruv
      if (holderYoilmi && profile.role === 'holder') {
        // Agar holder sahifasida bo'lsa va currentHolder yo'q bo'lsa
        if (!currentHolder) {
          console.log('Holder ma\'lumotlari yo\'q, login sahifasiga qaytish');
          navigate('/login', { replace: true });
          return;
        }
      }

      // Agar hech qanday maxsus yo'lda bo'lmasa va role mavjud bo'lsa
      if (!adminYoilmi && !holderYoilmi && profile.role) {
        if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (profile.role === 'holder') {
          navigate('/holder/dashboard', { replace: true });
        }
      }
    }
  }, [user, profile, loading, currentHolder, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}