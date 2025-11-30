# Railway'ga Deploy Qilish Qo'llanmasi

## Telegram Bot va Web App ni Railway'ga Deploy Qilish

### 1. Railway Hisob Yaratish

1. [Railway](https://railway.com/) ga o'ting
2. "Start a New Project" tugmasini bosing
3. GitHub bilan kirib, hisob yarating

### 2. Loyihani Deploy Qilish (Yagona Service)

Bizning loyiha **Monorepo** strukturasida bo'lib, bitta service ham Web App, ham Telegram Bot ni ishga tushiradi.

1. Railway dashboard'da "New Project" > "Deploy from GitHub repo" ni tanlang
2. `intizom_ai` repozitoriyani tanlang
3. "Add Variables" bo'limiga o'ting va quyidagilarni qo'shing:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
# RAILWAY_PUBLIC_DOMAIN ni Railway avtomatik qo'shadi (agar domain generatsiya qilinsa)
```

4. **Deploy** tugmasini bosing.

Railway avtomatik ravishda:
1. `npm install` qiladi
2. `npm run build` qiladi (Web va Server ni build qiladi)
3. `npm start` qiladi (Web server va Bot ni ishga tushiradi)

### 3. Domain Sozlash

1. Service settings'da "Networking" ga o'ting.
2. "Generate Domain" ni bosing (masalan: `ai-intizom-production.up.railway.app`).
3. Bu domain avtomatik ravishda Web App va Webhook URL sifatida ishlatiladi.

### 4. Bot Webhook (Avtomatik)

Bot ishga tushganda, agar `RAILWAY_PUBLIC_DOMAIN` mavjud bo'lsa, u avtomatik ravishda Webhookni o'sha domenga sozlaydi (`https://.../webhook`).
Siz hech narsa qilishingiz shart emas.

### 5. BotFather da Web App URL Sozlash

1. [@BotFather](https://t.me/BotFather) ga o'ting
2. `/mybots` > `@intizomAi_bot` ni tanlang
3. "Bot Settings" > "Menu Button" > "Configure Menu Button"
4. "Web App" ni tanlang
5. Railway'dan olingan Domain URL ni kiriting (masalan: `https://ai-intizom-production.up.railway.app`)

### 6. Test Qilish

1. Telegram'da botni oching.
2. `/start` bosing.
3. Bot javob beradi va Web App tugmasi chiqadi.
4. Tugmani bosganda Web App ochilishi kerak.

## Muhim Eslatmalar

- **Yagona Port:** Railway bitta port (odatda `PORT` env orqali) beradi. Bizning server (`server/index.ts`) shu portda Web App ni ham, Webhook ni ham eshitadi.
- **Build:** Loyiha `npm run build` orqali `dist` (Frontend) va `server-dist` (Backend) papkalarini yaratadi.

## Xatoliklar va Yechimlar

### Web App ochilmayapti (404 yoki Loading)
- Build jarayoni muvaffaqiyatli o'tganini tekshiring (`dist/index.html` bormi?).
- Logs da "Static files serving from dist/" xabari chiqdimi?

### Bot javob bermayapti
- `TELEGRAM_BOT_TOKEN` to'g'riligini tekshiring.
- Logs da "Webhook sozlandi" yoki "Long polling rejimi" yozuvini qidiring.


## Qo'shimcha Ma'lumot

- [Railway Documentation](https://docs.railway.app/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)

