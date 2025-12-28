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
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { setCurrentHolder } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Check if it's the admin access code
      const isAdmin = await verifyAdminAccessCode(accessCode);

      if (isAdmin) {
        // Admin login - use Supabase Auth
        // For admin, we'll use a fixed username "admin" with the access code as password
        const { error: signInError } = await signIn('admin', accessCode);

        if (signInError) {
          // If sign in fails, try to sign up (first time admin)
          const { error: signUpError } = await signUp('admin', accessCode);
          
          if (signUpError) {
            toast.error('Admin authentication failed');
            setLoading(false);
            return;
          }
        }

        toast.success('Welcome, Admin!');
        navigate('/admin/dashboard');
        return;
      }

      // Step 2: Check if it's a holder access code
      const holder = await getHolderByAccessCode(accessCode);

      if (holder) {
        // Holder login - store in session
        setCurrentHolder(holder);
        toast.success(`Welcome, ${holder.name}!`);
        navigate('/holder/dashboard');
        return;
      }

      // Step 3: Invalid access code
      toast.error('Invalid access code');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
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
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">
              LETHEX
            </CardTitle>
            <CardDescription className="text-base">
              Digital Asset Fund Management System
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium text-foreground">
                  Access Code
                </label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={loading}
                  className="h-12 text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Enter admin or holder access code to continue
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
                    Verifying...
                  </>
                ) : (
                  'Access System'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>Secure access • Real-time tracking • Manual approval</p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>© 2025 LETHEX. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
