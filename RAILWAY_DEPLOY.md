# Railway'ga Deploy Qilish Qo'llanmasi

## Telegram Bot va Web App ni Railway'ga Deploy Qilish

### 1. Railway Hisob Yaratish

1. [Railway](https://railway.com/) ga o'ting
2. "Start a New Project" tugmasini bosing
3. GitHub bilan kirib, hisob yarating

### 2. Bot Server ni Deploy Qilish

1. Railway dashboard'da "New Project" > "Deploy from GitHub repo" ni tanlang
2. `intizom_ai` repozitoriyani tanlang
3. Railway avtomatik ravishda `server/` papkasini topadi

#### Environment Variables Qo'shish

Railway dashboard'da "Variables" bo'limiga o'ting va quyidagilarni qo'shing:

```bash
TELEGRAM_BOT_TOKEN=8410285583:AAHmc2-YwK4MtDXzrmYFk-2n79RgtCRvpPE
GEMINI_API_KEY=your_gemini_api_key_here
WEB_APP_URL=https://your-web-app-url.railway.app
```

**Muhim:** `WEB_APP_URL` ni keyinroq Web App deploy qilgandan keyin qo'shing.

### 3. Web App ni Deploy Qilish

Web App uchun alohida service yarating:

1. Railway project'da "New" > "GitHub Repo" ni tanlang
2. Xuddi shu repozitoriyani tanlang
3. Service nomini "web-app" qilib qo'ying

#### Web App Environment Variables

```bash
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### Web App Start Command

Service settings'da:

```bash
Start Command: npm run dev
```

Yoki production uchun:

```bash
Start Command: npm run build && npm run preview
```

### 4. Custom Domain Sozlash (Ixtiyoriy)

1. Railway dashboard'da service'ni tanlang
2. "Settings" > "Networking" ga o'ting
3. "Generate Domain" tugmasini bosing
4. Olingan domain ni `.env` faylida `WEB_APP_URL` ga qo'ying

### 5. Bot Webhook Sozlash

Bot server deploy qilgandan keyin:

1. Railway'da bot service'ning URL ni oling
2. Webhook URL format: `https://your-bot-service.railway.app/webhook`
3. `.env` faylida yoki Railway Variables'da:
   ```bash
   USE_WEBHOOK=true
   WEBHOOK_URL=https://your-bot-service.railway.app/webhook
   ```

**Eslatma:** Hozircha long polling ishlatilmoqda. Webhook uchun webhook handler endpoint yaratish kerak.

### 6. BotFather da Web App URL Sozlash

1. [@BotFather](https://t.me/BotFather) ga o'ting
2. `/mybots` > `@intizomAi_bot` ni tanlang
3. "Bot Settings" > "Menu Button" > "Configure Menu Button"
4. "Web App" ni tanlang
5. Railway'dan olingan Web App HTTPS URL ni kiriting

### 7. Test Qilish

1. Telegram'da [@intizomAi_bot](https://t.me/intizomAi_bot) ni oching
2. `/start` buyrug'ini yuboring
3. Bot javob berishi kerak
4. Menu tugmasini bosing - Web App ochilishi kerak

## Railway Xususiyatlari

- ✅ Avtomatik HTTPS sertifikat
- ✅ Environment variables boshqaruvi
- ✅ Avtomatik restart
- ✅ Real-time loglar
- ✅ Custom domain qo'llab-quvvatlash
- ✅ Auto-scaling
- ✅ Monitoring va analytics

## Xatoliklar va Yechimlar

### Bot ishlamayapti

1. Railway logs'ni tekshiring
2. Environment variables to'g'ri sozlanganligini tekshiring
3. Bot token to'g'ri ekanligini tekshiring

### Web App ochilmayapti

1. Web App service'ning logs'ni tekshiring
2. HTTPS URL ishlatilayotganligini tekshiring
3. BotFather'da URL to'g'ri sozlanganligini tekshiring

## Qo'shimcha Ma'lumot

- [Railway Documentation](https://docs.railway.app/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)

