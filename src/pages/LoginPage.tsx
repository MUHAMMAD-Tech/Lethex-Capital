// src/pages/LoginPage.tsx - handleLogin funksiyasini qayta yozamiz
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!accessCode.trim()) {
    toast.error('Iltimos, kirish kodini kiriting');
    return;
  }

  setLoading(true);
  console.log('Login boshlandi, access code:', accessCode);

  try {
    // Step 1: Admin access code ni tekshirish
    const isAdmin = await verifyAdminAccessCode(accessCode);
    console.log('Admin tekshiruvi natijasi:', isAdmin);
    
    if (isAdmin) {
      console.log('Admin access code topildi, admin sifatida kirish...');
      
      // Admin uchun kirish
      const adminUsername = 'admin';
      
      // Avval SignIn urinib ko'rish
      const { error: signInError } = await signIn(adminUsername, accessCode);

      if (signInError) {
        console.log('Admin SignIn xatosi, SignUp urinilmoqda:', signInError.message);
        
        // Agar signIn xato bersa, signUp qilish
        const { error: signUpError } = await signUp(adminUsername, accessCode);
        
        if (signUpError) {
          console.error('Admin SignUp xatosi:', signUpError.message);
          toast.error('Admin yaratishda xatolik');
          setLoading(false);
          return;
        }
        
        console.log('Yangi admin SignUp qilindi');
        
        // Kichik kutish, keyin role ni o'rnatish
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            try {
              await updateProfileRole(user.id, 'admin');
              console.log('Admin role o\'rnatildi');
              
              // Biroz kutish va refresh
              setTimeout(async () => {
                await refreshProfile();
                toast.success('Xush kelibsiz, Admin!');
                navigate('/admin/dashboard');
              }, 500);
            } catch (roleError) {
              console.error('Admin role o\'rnatish xatosi:', roleError);
              toast.error('Role o\'rnatishda xatolik');
              setLoading(false);
            }
          }
        }, 1000);
        
        return;
      } else {
        console.log('Mavjud admin SignIn qilindi');
        
        // Mavjud adminning role ni tekshirish va yangilash
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await updateProfileRole(user.id, 'admin');
            console.log('Admin role yangilandi');
            
            // Profile ni refresh qilish
            await refreshProfile();
            
            toast.success('Xush kelibsiz, Admin!');
            navigate('/admin/dashboard');
            return;
          } catch (roleError) {
            console.error('Admin role yangilash xatosi:', roleError);
          }
        }
      }
    }

    // Step 2: Holder access code ni tekshirish
    console.log('Holder access code ni tekshirilmoqda...');
    const holder = await getHolderByAccessCode(accessCode);
    console.log('Holder tekshiruvi natijasi:', holder);
    
    if (holder) {
      console.log('Holder topildi:', holder.name);
      
      // Holder uchun username
      const holderUsername = holder.username || `holder_${holder.id.slice(0, 8)}`;
      console.log('Holder username:', holderUsername);

      // Holder SignIn urinib ko'rish
      const { error: holderSignInError } = await signIn(holderUsername, accessCode);

      if (holderSignInError) {
        console.log('Holder SignIn xatosi, SignUp urinilmoqda:', holderSignInError.message);
        
        // Holder SignUp qilish
        const { error: holderSignUpError } = await signUp(holderUsername, accessCode);
        
        if (holderSignUpError) {
          console.error('Holder SignUp xatosi:', holderSignUpError.message);
          toast.error('Holder yaratishda xatolik');
          setLoading(false);
          return;
        }
        
        console.log('Yangi holder SignUp qilindi');
        
        // Kichik kutish, keyin role ni o'rnatish
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            try {
              await updateProfileRole(user.id, 'holder');
              console.log('Holder role o\'rnatildi');
              
              // Holder ma'lumotlarini saqlash
              setCurrentHolder(holder);
              
              // Biroz kutish va refresh
              setTimeout(async () => {
                await refreshProfile();
                toast.success(`Xush kelibsiz, ${holder.name}!`);
                navigate('/holder/dashboard');
              }, 500);
            } catch (roleError) {
              console.error('Holder role o\'rnatish xatosi:', roleError);
              toast.error('Holder role o\'rnatishda xatolik');
              setLoading(false);
            }
          }
        }, 1000);
        
        return;
      } else {
        console.log('Mavjud holder SignIn qilindi');
        
        // Mavjud holderni role ni tekshirish va yangilash
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await updateProfileRole(user.id, 'holder');
            console.log('Holder role yangilandi');
            
            // Holder ma'lumotlarini saqlash
            setCurrentHolder(holder);
            
            // Profile ni refresh qilish
            await refreshProfile();
            
            toast.success(`Xush kelibsiz, ${holder.name}!`);
            navigate('/holder/dashboard');
            return;
          } catch (roleError) {
            console.error('Holder role yangilash xatosi:', roleError);
          }
        }
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