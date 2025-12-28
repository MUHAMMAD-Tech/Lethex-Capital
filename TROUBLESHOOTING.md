# LETHEX - Muammolarni Bartaraf Etish

## "Noto'g'ri kirish kodi" Xatosi

### Muammo
"Muso2909" kirish kodini kiritganda "Noto'g'ri kirish kodi" xatosi chiqadi.

### Yechim
Ushbu muammo hal qilindi. Quyidagi o'zgarishlar amalga oshirildi:

#### 1. Ma'lumotlar Bazasi Ruxsatlari
- `system_settings` jadvali uchun umumiy o'qish ruxsati qo'shildi
- `holders` jadvali uchun umumiy o'qish ruxsati qo'shildi
- Bu login sahifasida autentifikatsiyasiz kirish kodlarini tekshirish imkonini beradi

#### 2. Debug Loglar
Login jarayoniga quyidagi loglar qo'shildi:
- Kirish kodi tekshiruvi boshlanganda
- Admin tekshiruvi natijasi
- SignIn/SignUp jarayonlari
- Holder tekshiruvi natijasi

### Tekshirish Qadamlari

1. **Brauzer konsolini oching**:
   - Chrome/Edge: F12 yoki Ctrl+Shift+I
   - Firefox: F12 yoki Ctrl+Shift+K
   - Safari: Cmd+Option+I

2. **Console tabiga o'ting**

3. **Login sahifasiga o'ting va "Muso2909" ni kiriting**

4. **Konsolda quyidagi xabarlarni ko'ring**:
   ```
   Kirish kodi tekshirilmoqda: Muso2909
   Admin tekshiruvi natijasi: true
   Admin sifatida kirish...
   ```

5. **Agar "Admin tekshiruvi natijasi: false" ko'rsatilsa**:
   - Ma'lumotlar bazasida xato bor
   - Quyidagi SQL so'rovni bajaring:
   ```sql
   SELECT * FROM public.system_settings WHERE id = 1;
   ```
   - `admin_access_code` maydoni "Muso2909" bo'lishi kerak

6. **Agar "Admin tekshiruvi natijasi: true" lekin kirish muvaffaqiyatsiz bo'lsa**:
   - SignIn/SignUp xatolarini konsolda tekshiring
   - Supabase Auth sozlamalari to'g'ri ekanligini tekshiring

### Agar Muammo Davom Etsa

#### Variant 1: Ma'lumotlar Bazasini Tekshirish
```sql
-- Admin kirish kodini tekshirish
SELECT admin_access_code FROM public.system_settings WHERE id = 1;

-- Natija: {"admin_access_code": "Muso2909"}
```

#### Variant 2: Kirish Kodini Qayta O'rnatish
Agar admin kirish kodi noto'g'ri bo'lsa, quyidagi SQL so'rovni bajaring:
```sql
UPDATE public.system_settings 
SET admin_access_code = 'Muso2909', updated_at = NOW() 
WHERE id = 1;
```

#### Variant 3: RLS Siyosatlarini Tekshirish
```sql
-- system_settings jadvali uchun siyosatlarni ko'rish
SELECT * FROM pg_policies WHERE tablename = 'system_settings';

-- Kutilayotgan siyosatlar:
-- 1. "Anyone can view system settings" - SELECT - true
-- 2. "Admins can update system settings" - UPDATE - is_admin(auth.uid())
```

### Yangi Admin Yaratish

Agar birinchi marta kirayotgan bo'lsangiz:

1. "Muso2909" ni kiriting
2. Tizim avtomatik ravishda admin akkaunt yaratadi
3. Email: admin@miaoda.com
4. Parol: Muso2909
5. Admin paneliga yo'naltirilasiz

### Xavfsizlik Tavsiyalari

Birinchi kirishdan keyin:

1. **Sozlamalar** sahifasiga o'ting
2. **Admin kirish kodini o'zgartiring**
3. Yangi kod:
   - Kamida 6 belgi
   - Kuchli va noyob bo'lishi kerak
   - Xavfsiz joyda saqlang

### Umumiy Xatolar

#### Xato 1: "Error fetching system settings"
**Sabab**: Ma'lumotlar bazasiga ulanish muammosi
**Yechim**: 
- Internet aloqasini tekshiring
- Supabase xizmati ishlayotganini tekshiring
- `.env` faylida Supabase URL va anon key to'g'ri ekanligini tekshiring

#### Xato 2: "Admin autentifikatsiyasi muvaffaqiyatsiz"
**Sabab**: Supabase Auth xatosi
**Yechim**:
- Email verification o'chirilganligini tekshiring
- Supabase Auth sozlamalari to'g'ri ekanligini tekshiring
- Konsolda batafsil xato xabarini ko'ring

#### Xato 3: "Kirish paytida xatolik yuz berdi"
**Sabab**: Kutilmagan xato
**Yechim**:
- Brauzer konsolida batafsil xato xabarini ko'ring
- Sahifani yangilang va qayta urinib ko'ring
- Brauzer cache'ini tozalang

## Holder Kirish Muammolari

### Holder Kirish Kodi Topilmadi

**Sabab**: Holder hali yaratilmagan yoki kirish kodi noto'g'ri

**Yechim**:
1. Admin sifatida tizimga kiring
2. **Holderlar** sahifasiga o'ting
3. Yangi holder qo'shing
4. Avtomatik yaratilgan kirish kodini nusxalang
5. Holder uchun ushbu kodni bering

### Holder Kirish Kodi Ishlayapti, Lekin Dashboard Ko'rinmayapti

**Sabab**: Session saqlash muammosi

**Yechim**:
1. Brauzer konsolini oching
2. Application/Storage tabiga o'ting
3. Session Storage'da "lethex_holder" mavjudligini tekshiring
4. Agar yo'q bo'lsa, qayta login qiling

## Qo'shimcha Yordam

Agar yuqoridagi yechimlar yordam bermasa:

1. Brauzer konsolidan barcha xato xabarlarini nusxalang
2. Network tabidan muvaffaqiyatsiz so'rovlarni tekshiring
3. Supabase Dashboard'da Logs bo'limini tekshiring
4. Texnik yordam uchun admin bilan bog'laning

## Tizim Talablari

- Zamonaviy brauzer (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript yoqilgan bo'lishi kerak
- Cookies va Local Storage ruxsat etilgan bo'lishi kerak
- Barqaror internet aloqasi
