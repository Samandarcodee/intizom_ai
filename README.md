<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1M52EypeSoqs-ZcaOl-5InngD4pFxyR-8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Telegram Mini App sifatida ishga tushirish

### Bot ma'lumotlari

- **Bot Username:** [@intizomAi_bot](https://t.me/intizomAi_bot)
- **Bot Token:** `.env` faylida saqlangan

### 1. Environment variables sozlash

`.env` faylida quyidagi o'zgaruvchilar mavjud:

```bash
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=8410285583:AAHmc2-YwK4MtDXzrmYFk-2n79RgtCRvpPE
TELEGRAM_BOT_USERNAME=intizomAi_bot
WEB_APP_URL=http://localhost:3000  # Development uchun, production da HTTPS URL kiriting
```

### 2. Bot serverini ishga tushirish

Botni ishga tushirish uchun:

```bash
# Bot serverini ishga tushirish (long polling)
npm run bot

# Yoki development rejimida (avtomatik qayta yuklash)
npm run bot:dev
```

Bot ishga tushganda:
- ✅ Bot ma'lumotlari tekshiriladi
- ✅ Menu button sozlanadi
- ✅ `/start`, `/help`, `/app` buyruqlari ishlaydi
- ✅ Web App URL yuboriladi

**Buyruqlar:**
- `/start` - Botni ishga tushirish va Web App ni ochish
- `/help` - Yordam olish
- `/app` - Web App ni ochish

### 3. Web App sozlash

1. [@BotFather](https://t.me/BotFather) ga o'ting
2. `/mybots` buyrug'ini yuboring
3. `@intizomAi_bot` ni tanlang
4. "Bot Settings" > "Menu Button" > "Configure Menu Button"
5. "Web App" ni tanlang va Web App URL ni kiriting

**Muhim:** 
- Web App HTTPS orqali ishlashi kerak!
- URL format: `https://your-domain.com`
- Deploy qilgandan keyin URL ni kiriting

### 4. Production deployment

#### Variant 1: Railway (Tavsiya etiladi - Bot uchun)

[Railway](https://railway.com/) - Telegram bot va Web App uchun eng qulay platforma.

**Qadamlar:**

1. [Railway](https://railway.com/) ga kirib, hisob yarating
2. "New Project" > "Deploy from GitHub repo" ni tanlang
3. Repozitoriyangizni tanlang
4. Environment variables qo'shing:
   - `TELEGRAM_BOT_TOKEN` - Bot token
   - `GEMINI_API_KEY` - Gemini API key
   - `WEB_APP_URL` - Web App URL (HTTPS bo'lishi kerak)
5. Deploy qiling

**Railway xususiyatlari:**
- ✅ Avtomatik HTTPS
- ✅ Environment variables boshqaruvi
- ✅ Avtomatik restart
- ✅ Loglar monitoring
- ✅ Custom domain qo'llab-quvvatlash

**Web App URL ni olish:**
- Railway deploy qilgandan keyin, Web App uchun alohida service yarating
- Yoki Vercel/Netlify'da Web App ni deploy qiling
- Olingan HTTPS URL ni `WEB_APP_URL` ga qo'ying

#### Variant 2: Vercel (Web App uchun)

```bash
# Vercel CLI o'rnatish
npm i -g vercel

# Deploy qilish
vercel

# Environment variable qo'shish
vercel env add GEMINI_API_KEY
```

#### Variant 2: Netlify

```bash
# Netlify CLI o'rnatish
npm i -g netlify-cli

# Deploy qilish
netlify deploy --prod
```

#### Variant 3: Boshqa hosting

1. `npm run build` buyrug'i bilan build qiling
2. `dist` papkasini hosting serveriga yuklang
3. HTTPS sertifikatini sozlang (Let's Encrypt yoki boshqa)

### 5. Web App URL ni BotFather ga yuborish

Web App URL format: `https://your-domain.com`

**Eslatma:** 
- URL HTTPS bo'lishi kerak
- URL Telegram tomonidan tekshiriladi
- Domain whitelist ga qo'shilishi kerak

### 6. Test qilish

1. Botingizni oching
2. Menu tugmasini bosing
3. Web App ochilishi kerak

### Telegram WebApp xususiyatlari

- ✅ Telegram user ma'lumotlarini avtomatik olish
- ✅ Telegram tilini avtomatik aniqlash
- ✅ Telegram Premium foydalanuvchilarini aniqlash
- ✅ Haptic feedback (taktil javob)
- ✅ Telegram tema ranglarini qo'llab-quvvatlash
- ✅ Back button boshqaruvi
- ✅ Main button boshqaruvi

### Development uchun test

**Muhim:** Telegram Web App faqat HTTPS URL larni qabul qiladi. Development uchun quyidagi variantlardan birini ishlatishingiz mumkin:

#### Variant 1: ngrok (Tavsiya etiladi)

```bash
# ngrok o'rnatish
npm install -g ngrok

# ngrok ishga tushirish
ngrok http 3000
```

Olingan HTTPS URL ni `.env` faylida `WEB_APP_URL` ga qo'ying:
```bash
WEB_APP_URL=https://your-ngrok-url.ngrok.io
```

#### Variant 2: localtunnel

```bash
# localtunnel ishlatish
npx localtunnel --port 3000
```

Olingan HTTPS URL ni `.env` faylida `WEB_APP_URL` ga qo'ying.

#### Variant 3: HTTP URL (Development)

Agar HTTP URL ishlatsangiz (`http://localhost:3000`), bot ishlaydi, lekin:
- Menu button sozlanmaydi
- Web App tugmalari ko'rsatilmaydi
- Bot buyruqlari (`/start`, `/help`, `/app`) ishlaydi

**Eslatma:** Production uchun mutlaqo HTTPS URL ishlatishingiz kerak!
