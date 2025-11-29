# Railway Public Networking Sozlash Qo'llanmasi

## Port Sozlash

### Variant 1: Railway'ning avtomatik PORT'ini ishlatish (Tavsiya etiladi)

Railway avtomatik ravishda `PORT` environment variable'ni beradi. Bizning kodimiz buni avtomatik qabul qiladi.

**Qanday sozlash:**

1. Railway Dashboard'da service'ni tanlang
2. "Settings" > "Networking" bo'limiga o'ting
3. "Generate Service Domain" tugmasini bosing
4. **Target port** bo'limida Railway'ning bergan PORT'ini kiriting

**PORT'ni qanday topish:**

- Railway logs'da ko'rinadi: `🌐 Web App server ishga tushdi: http://0.0.0.0:XXXX`
- Yoki Environment Variables'da `PORT` ni tekshiring
- Yoki Railway avtomatik ravishda beradi (odatda 3000 yoki boshqa)

**Agar PORT ko'rsatilmagan bo'lsa:**

Railway'da "Variables" bo'limiga o'ting va `PORT` ni qo'shing:
```
PORT=3000
```

Keyin Target port'ga `3000` kiriting.

### Variant 2: Aniq port belgilash (8080)

Agar 8080 port'ni ishlatmoqchi bo'lsangiz:

1. Railway'da "Variables" bo'limiga o'ting
2. `PORT` variable'ni qo'shing yoki o'zgartiring:
   ```
   PORT=8080
   ```
3. "Networking" bo'limida Target port'ga `8080` kiriting

**Eslatma:** Kodda `process.env.PORT || 3000` ishlatilgani uchun, Railway'ning bergan PORT'ini avtomatik qabul qiladi.

## To'liq Sozlash Qadamlari

### 1. Generate Service Domain

1. Railway Dashboard'da service'ni tanlang
2. "Settings" > "Networking" bo'limiga o'ting
3. "Generate Service Domain" tugmasini bosing
4. Target port'ni kiriting (Railway'ning bergan PORT yoki 3000)
5. "Generate Domain" tugmasini bosing

### 2. Custom Domain (Ixtiyoriy)

1. "Custom Domain" bo'limiga o'ting
2. Domain nomini kiriting
3. DNS sozlamalarini qo'llang

## Muhim Eslatmalar

1. **PORT Environment Variable:**
   - Railway avtomatik ravishda `PORT` beradi
   - Kodda `process.env.PORT || 3000` ishlatilgan
   - Agar PORT berilmasa, 3000 ishlatiladi

2. **Target Port:**
   - Railway'ning bergan PORT'iga mos bo'lishi kerak
   - Yoki Environment Variables'da `PORT` ni belgilang

3. **HTTP vs HTTPS:**
   - Railway avtomatik ravishda HTTPS beradi
   - Custom domain uchun SSL sertifikat avtomatik sozlanadi

## Bizning loyiha uchun tavsiya

### 1. Environment Variables'da PORT qo'shing:

```
PORT=3000
```

### 2. Networking'da Target port'ga kiriting:

```
3000
```

### 3. Generate Domain tugmasini bosing

Bu sozlamalar bilan:
- ✅ Service public domain oladi
- ✅ HTTPS avtomatik sozlanadi
- ✅ Web App va Bot server ishlaydi
- ✅ Telegram Web App URL sifatida ishlatish mumkin

## Test Qilish

1. Generate Domain qilgandan keyin, olingan URL ni oching
2. Web App ko'rinishi kerak
3. `/health` endpoint'ni tekshiring: `https://your-domain.railway.app/health`
4. Telegram BotFather'da Web App URL ni sozlang

