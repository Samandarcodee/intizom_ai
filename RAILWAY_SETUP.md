# Railway Sozlash Qo'llanmasi

## Watch Paths (Gitignore-style rules)

Watch Paths - bu qaysi fayllar o'zgarganda yangi deployment trigger qilishni belgilaydi.

### Qanday sozlash:

1. Railway Dashboard'da service'ni tanlang
2. "Settings" > "Deploy" bo'limiga o'ting
3. "Watch Paths" bo'limida "Add pattern" tugmasini bosing

### Tavsiya etilgan pattern'lar:

```
/**
```

Bu barcha o'zgarishlarni kuzatadi. Yoki aniqroq:

```
/src/**
/server/**
/components/**
/services/**
/store/**
/utils/**
package.json
package-lock.json
tsconfig.json
vite.config.ts
```

**Eslatma:** Agar pattern qo'shmasangiz, Railway barcha o'zgarishlarni kuzatadi.

### Pattern format:

- `/**` - Barcha fayllar
- `/src/**` - src papkasidagi barcha fayllar
- `package.json` - Faqat package.json
- `!node_modules/**` - node_modules ni ignore qilish (avtomatik)

## Custom Start Command

### Qanday sozlash:

1. Railway Dashboard'da service'ni tanlang
2. "Settings" > "Deploy" bo'limiga o'ting
3. "Start Command" bo'limida command kiriting

### Bizning loyiha uchun Start Command:

```bash
npm run build && npm run bot
```

Yoki:

```bash
npm install && npm run build && npm run bot
```

### Pre-deploy Step (Ixtiyoriy)

Agar pre-deploy step kerak bo'lsa:

1. "Add pre-deploy step" tugmasini bosing
2. Command kiriting, masalan:

```bash
npm install
```

Yoki:

```bash
npm ci
```

## To'liq Sozlash Misoli

### Variant 1: Minimal (Tavsiya etiladi)

**Watch Paths:**
```
/**
```

**Start Command:**
```
npm run build && npm run bot
```

**Pre-deploy Step:**
```
npm install
```

### Variant 2: Aniq Pattern'lar

**Watch Paths:**
```
/src/**
/server/**
/components/**
/services/**
/store/**
/utils/**
package.json
package-lock.json
tsconfig.json
vite.config.ts
railway.json
railway.toml
```

**Start Command:**
```
npm run build && npm run bot
```

**Pre-deploy Step:**
```
npm ci
```

## Muhim Eslatmalar

1. **Watch Paths** - Faqat git push qilingan o'zgarishlarni kuzatadi
2. **Start Command** - Har bir deployment'da ishga tushadi
3. **Pre-deploy Step** - Start command'dan oldin ishga tushadi
4. **Build Command** - Railway.json yoki railway.toml'da belgilanadi

## Bizning loyiha uchun tavsiya

### Watch Paths:
```
/**
```

### Start Command:
```
npm run build && npm run bot
```

### Pre-deploy Step (ixtiyoriy):
```
npm install
```

Bu sozlamalar bilan:
- ✅ Barcha o'zgarishlar kuzatiladi
- ✅ Avval build qilinadi
- ✅ Keyin bot va web server ishga tushadi
- ✅ Har bir git push'da avtomatik deploy qilinadi

