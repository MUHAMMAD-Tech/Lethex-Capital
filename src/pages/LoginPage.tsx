import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/db/supabase';
import { verifyAdminAccessCode, getHolderByAccessCode } from '@/db/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, updateProfileRole } = useAuth();
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

      // Step 1: Admin access code ni tekshirish
      const isAdmin = await verifyAdminAccessCode(accessCode);
      console.log('Admin tekshiruvi natijasi:', isAdmin);

      if (isAdmin) {
        console.log('Admin sifatida kirish...');
        
        // Admin login yoki register
        let authSuccess = false;
        const adminUsername = 'admin';

        // Avval signIn urinib ko'rish
        const { error: signInError } = await signIn(adminUsername, accessCode);

        if (signInError) {
          console.log('SignIn xatosi, SignUp urinilmoqda:', signInError.message);
          
          // Agar signIn xato bersa, signUp qilish
          const { error: signUpError } = await signUp(adminUsername, accessCode);

          if (signUpError) {
            console.error('SignUp xatosi:', signUpError.message);
            toast.error('Admin yaratishda xatolik');
            setLoading(false);
            return;
          } else {
            console.log('Admin SignUp muvaffaqiyatli');
            
            // Yangi admin yaratilganda role ni o'rnatish
            // Bir oz kutish kerak, chunki profile avtomatik yaratiladi
            setTimeout(async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await updateProfileRole(user.id, 'admin');
              }
            }, 1000);
            
            authSuccess = true;
          }
        } else {
          console.log('Admin SignIn muvaffaqiyatli');
          authSuccess = true;
          
          // Mavjud adminning role ni tekshirish va yangilash
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await updateProfileRole(user.id, 'admin');
          }
        }

        if (authSuccess) {
          toast.success('Xush kelibsiz, Admin!');
          navigate('/admin/dashboard');
          return;
        }
      }

      // Step 2: Holder access code ni tekshirish
      console.log('Holder sifatida tekshirilmoqda...');
      const holder = await getHolderByAccessCode(accessCode);
      console.log('Holder topildi:', holder);

      if (holder) {
        // Holder uchun username olish
        const holderUsername = holder.username || `holder_${holder.id.slice(0, 8)}`;
        
        // Holder login yoki register
        let holderAuthSuccess = false;

        // SignIn urinib ko'rish
        const { error: holderSignInError } = await signIn(holderUsername, accessCode);

        if (holderSignInError) {
          console.log('Holder SignIn xatosi, SignUp urinilmoqda:', holderSignInError.message);
          
          // Agar signIn xato bersa, signUp qilish
          const { error: holderSignUpError } = await signUp(holderUsername, accessCode);

          if (holderSignUpError) {
            console.error('Holder SignUp xatosi:', holderSignUpError.message);
            toast.error('Holder yaratishda xatolik');
            setLoading(false);
            return;
          } else {
            console.log('Holder SignUp muvaffaqiyatli');
            
            // Yangi holder yaratilganda role ni o'rnatish
            setTimeout(async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await updateProfileRole(user.id, 'holder');
              }
            }, 1000);
            
            holderAuthSuccess = true;
          }
        } else {
          console.log('Holder SignIn muvaffaqiyatli');
          holderAuthSuccess = true;
          
          // Mavjud holderni role ni tekshirish va yangilash
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await updateProfileRole(user.id, 'holder');
          }
        }

        if (holderAuthSuccess) {
          // Holder ma'lumotlarini store ga saqlash
          setCurrentHolder(holder);
          toast.success(`Xush kelibsiz, ${holder.name}!`);
          navigate('/holder/dashboard');
          return;
        }
      }

      // Step 3: Noto'g'ri access code
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
                  type="text"
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