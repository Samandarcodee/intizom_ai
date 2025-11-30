# Railway PostgreSQL Sozlash Qo'llanmasi

Loyihada real ma'lumotlar bilan ishlash uchun **PostgreSQL** ma'lumotlar bazasini ulash kerak.

## 1. PostgreSQL Service Qo'shish

1.  **Railway Dashboard** ga kiring.
2.  Loyiha ichida **"New"** tugmasini bosing.
3.  **"Database"** -> **"PostgreSQL"** ni tanlang.
4.  Biroz kuting, ma'lumotlar bazasi yaratiladi.

## 2. DATABASE_URL ni Ulash

1.  Yaratilgan PostgreSQL service ustiga bosing.
2.  **"Variables"** bo'limiga o'ting.
3.  `DATABASE_URL` ni nusxalab oling (yoki avtomatik ravishda `DATABASE_URL` deb nomlangan bo'lsa, ulanib ketishi mumkin, lekin ishonch hosil qilish kerak).
4.  **Asosiy Loyihangiz** (Web/Bot service) ga qayting.
5.  **"Variables"** bo'limiga o'ting.
6.  Yangi o'zgaruvchi qo'shing:
    *   Key: `DATABASE_URL`
    *   Value: (PostgreSQL dan olingan URL)

> **Eslatma:** Agar Railway ikkala servisni bitta loyiha ichida yaratsa, `DATABASE_URL` avtomatik ravishda shared variable sifatida qo'shilishi mumkin. Tekshirib ko'ring.

## 3. Migratsiya (Jadvallarni yaratish)

Bizning kodimizda `package.json` ichidagi `build` buyrug'i `prisma generate` ni bajaradi.
Lekin birinchi marta jadvallarni yaratish uchun Railway terminalida yoki lokal kompyuterda (agar `DATABASE_URL` lokal `.env` da bo'lsa) quyidagi buyruqni ishlatish kerak:

**Railway da (tavsiya etiladi):**
1.  Asosiy Service -> **Settings** -> **Deploy** -> **Build Command** ni tekshiring.
2.  Agar kerak bo'lsa, `npx prisma migrate deploy` ni build jarayoniga qo'shish mumkin, lekin eng oson yo'li:
    *   Service terminalini oching (agar bo'lsa).
    *   Yoki lokal kompyuteringizda `.env` fayliga Railway'dagi `DATABASE_URL` ni qo'ying.
    *   Buyruq bering:
        ```bash
        npx prisma migrate deploy
        ```

**Avtomatik Migratsiya (Deploy paytida):**
Eng yaxshi yo'li - `package.json` dagi build scriptni o'zgartirish (Men buni qilib bo'ldim, lekin `migrate deploy` qo'shish kerak).

Hozirgi `build` script:
```json
"build": "npx prisma generate && npm run build:web && npm run build:server"
```

Railway'da ma'lumotlar bazasi jadvallarini yaratish uchun Start Commandga qo'shish yoki alohida bajarish kerak.
Men `nixpacks.toml` faylini yangilab, build paytida migratsiya qilishni tavsiya qilaman.

## 4. Data Sync

Endi Web App ochilganda, u serverga `POST /api/init` so'rovini yuboradi va ma'lumotlar bazasidan foydalanuvchi ma'lumotlarini yuklaydi.

