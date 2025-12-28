# LETHEX - Foydalanish Qo'llanmasi

## Tizimga Kirish

### Admin Kirish
1. Login sahifasiga o'ting
2. Kirish kodi maydoniga `Muso2909` ni kiriting
3. "Tizimga kirish" tugmasini bosing
4. Birinchi marta kirganda, tizim avtomatik ravishda admin akkauntini yaratadi
5. Admin paneliga yo'naltirilasiz

### Holder Kirish
1. Login sahifasiga o'ting
2. Admin tomonidan berilgan kirish kodini kiriting
3. "Tizimga kirish" tugmasini bosing
4. Holder dashboard'ga yo'naltirilasiz

## Admin Panel Funksiyalari

### 1. Boshqaruv Paneli (Dashboard)
- Umumiy statistika
- Holderlar soni
- Kutilayotgan tasdiqlar
- Jami komissiyalar

### 2. Sozlamalar (Settings)
- Admin kirish kodini o'zgartirish
- Yangi kod kamida 6 belgidan iborat bo'lishi kerak
- O'zgartirishdan keyin yangi kod bilan kirish kerak

### 3. Holderlar (Holders)
- Yangi holder qo'shish
- Holder ma'lumotlarini tahrirlash
- Holderni o'chirish
- Har bir holder uchun avtomatik kirish kodi yaratiladi
- Kirish kodini nusxalash mumkin

### 4. Aktivlar (Assets) - Ishlab chiqilmoqda
- Holderlarga tokenlar tayinlash
- Token miqdorlarini tahrirlash
- Portfolio ko'rish

### 5. Tasdiqlar (Approvals) - Ishlab chiqilmoqda
- Swap so'rovlarini tasdiqlash
- Buy so'rovlarini tasdiqlash
- Sell so'rovlarini ko'rish

### 6. Tarix (History) - Ishlab chiqilmoqda
- Barcha tranzaksiyalar tarixi
- Filtrlash va qidirish

### 7. Komissiyalar (Commissions) - Ishlab chiqilmoqda
- Jami komissiyalar
- Holder bo'yicha taqsimlash

## Holder Dashboard Funksiyalari

### 1. Boshqaruv Paneli (Dashboard)
- Portfolio qiymati (USDT va KGS)
- Aktivlar soni
- Kutilayotgan so'rovlar

### 2. Portfolio - Ishlab chiqilmoqda
- Barcha aktivlarni ko'rish
- Real vaqtda narxlar
- USDT va KGS valyutalarida qiymat

### 3. Tranzaksiyalar - Ishlab chiqilmoqda
- Swap so'rovi yuborish
- Buy so'rovi yuborish
- Sell so'rovi yuborish

### 4. Tarix - Ishlab chiqilmoqda
- Shaxsiy tranzaksiyalar tarixi
- Batafsil ma'lumot

## Texnik Ma'lumotlar

### Token Whitelist (Top 50)
Tizimda faqat quyidagi tokenlar qo'llab-quvvatlanadi:
BTC, ETH, USDT, BNB, SOL, USDC, XRP, TON, ADA, DOGE, AVAX, TRX, DOT, MATIC, LINK, ICP, NEAR, LTC, BCH, ATOM, XLM, UNI, ETC, XMR, OKB, APT, HBAR, FIL, ARB, VET, QNT, MKR, CRO, ALGO, AAVE, GRT, EOS, FTM, THETA, XTZ, IMX, INJ, OP, RNDR, KAVA, ZEC, MINA, DASH, IOTA, CAKE

### Narxlar
- CoinGecko API orqali real vaqtda yangilanadi
- Yangilanish intervali: 1 soniya
- USDT va KGS valyutalarida ko'rsatiladi

### Xavfsizlik
- Kirish kod tizimi
- Admin va holder rollari
- Supabase RLS (Row Level Security)
- Barcha tranzaksiyalar qo'lda tasdiqlanadi

## Muammolarni Hal Qilish

### "Noto'g'ri kirish kodi" xatosi
- Kirish kodini to'g'ri kiritganingizni tekshiring
- Admin uchun standart kod: `Muso2909`
- Holder uchun admin tomonidan berilgan kodni ishlating

### Birinchi marta admin kirish
- `Muso2909` kodini kiriting
- Tizim avtomatik ravishda admin akkauntini yaratadi
- Keyin Sozlamalar orqali kodini o'zgartirishingiz mumkin

### Narxlar ko'rinmayapti
- Internet aloqasini tekshiring
- Sahifani yangilang
- CoinGecko API ishlayotganini tekshiring

## Qo'shimcha Yordam

Qo'shimcha yordam yoki savol-javoblar uchun admin bilan bog'laning.
