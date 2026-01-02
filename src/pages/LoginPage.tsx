// LETHEX Login Page - Unified Access Code System
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';
import { verifyAdminAccessCode, getHolderByAccessCode } from '@/db/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { setCurrentHolder } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Iltimos, kirish kodini kiriting');
      return;
    }

    setLoading(true);

    try {
      console.log('Kirish kodi tekshirilmoqda:', accessCode);
      
      // Step 1: Check if it's the admin access code
      const isAdmin = await verifyAdminAccessCode(accessCode);
      console.log('Admin tekshiruvi natijasi:', isAdmin);

      if (isAdmin) {
        console.log('Admin sifatida kirish...');
        // Admin login - use Supabase Auth
        // For admin, we'll use a fixed username "admin" with the access code as password
        let authSuccess = false;
        
        // Try to sign in first
        const { error: signInError } = await signIn('admin', accessCode);

        if (signInError) {
          console.log('SignIn xatosi, SignUp urinilmoqda:', signInError.message);
          // If sign in fails, try to sign up (first time admin)
          const { error: signUpError } = await signUp('admin', accessCode);
          
          if (!signUpError) {
            console.log('SignUp muvaffaqiyatli');
            authSuccess = true;
          } else {
            console.error('SignUp xatosi:', signUpError.message);
          }
        } else {
          console.log('SignIn muvaffaqiyatli');
          authSuccess = true;
        }

        if (authSuccess) {
          toast.success('Xush kelibsiz, Admin!');
          navigate('/admin/dashboard');
          return;
        } else {
          toast.error('Admin autentifikatsiyasi muvaffaqiyatsiz');
          setLoading(false);
          return;
        }
      }

      console.log('Holder sifatida tekshirilmoqda...');
      // Step 2: Check if it's a holder access code
      const holder = await getHolderByAccessCode(accessCode);
      console.log('Holder topildi:', holder);

      if (holder) {
        // Holder login - store in session
        setCurrentHolder(holder);
        toast.success(`Xush kelibsiz, ${holder.name}!`);
        navigate('/holder/dashboard');
        return;
      }

      // Step 3: Invalid access code
      console.log('Kirish kodi topilmadi');
      toast.error('Noto\'g\'ri kirish kodi');
    } catch (error) {
      console.error('Login xatosi:', error);
      toast.error('Kirish paytida xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border bg-card card-glow">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
              <img 
                src="/lethex-logo.png" 
                alt="LETHEX Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">
              LETHEX
            </CardTitle>
            <CardDescription className="text-base">
              Raqamli aktivlar fondini boshqarish tizimi
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium text-foreground">
                  Kirish kodi
                </label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Kirish kodingizni kiriting"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={loading}
                  className="h-12 text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Davom etish uchun admin yoki holder kirish kodini kiriting
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  'Tizimga kirish'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>Xavfsiz kirish • Real vaqtda kuzatish • Qo'lda tasdiqlash</p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>© 2025 LETHEX. Barcha huquqlar himoyalangan.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
