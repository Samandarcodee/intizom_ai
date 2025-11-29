#!/usr/bin/env node

import { getMe, setMenuButton, startPolling, deleteWebhook, setWebhook } from './bot.js';
import { startWebServer } from './web.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    console.warn('⚠️  .env faylini o\'qib bo\'lmadi, process.env dan olinmoqda');
    return {};
  }
}

const env = loadEnv();
const WEB_APP_URL = env.WEB_APP_URL || process.env.WEB_APP_URL;
const WEBHOOK_URL = env.WEBHOOK_URL || process.env.WEBHOOK_URL;
const USE_WEBHOOK = env.USE_WEBHOOK === 'true' || process.env.USE_WEBHOOK === 'true';
const PORT = process.env.PORT || '3000';

// Auto-detect Railway domain for webhook
let detectedWebhookUrl = WEBHOOK_URL;
if (!detectedWebhookUrl && process.env.RAILWAY_PUBLIC_DOMAIN) {
  detectedWebhookUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`;
  console.log(`🔍 Railway domain aniqlandi: ${detectedWebhookUrl}`);
}

async function main() {
  // Start Web App server FIRST (so it always works)
  console.log('🌐 Web App server ishga tushmoqda...');
  startWebServer();

  // Then try to start bot (if it fails, Web App still works)
  try {
    console.log('\n🤖 AI-INTIZOM Telegram Bot ishga tushmoqda...\n');

    // Check bot info
    const botInfo = await getMe();
    if (!botInfo) {
      console.error('❌ Bot ma\'lumotlarini olishda xato. Bot token ni tekshiring.');
      console.warn('⚠️  Bot ishlamayapti, lekin Web App ishlayapti.');
      return; // Don't exit, let Web App continue
    }

    console.log(`✅ Bot: @${botInfo.username} (${botInfo.first_name})\n`);

    // Set menu button (only if HTTPS URL)
    if (WEB_APP_URL) {
      console.log('📱 Menu button sozlanmoqda...');
      const result = await setMenuButton();
      if (result.skipped) {
        console.log('💡 Development uchun HTTPS tunnel ishlatishingiz mumkin:');
        console.log('   - ngrok: ngrok http 3000');
        console.log('   - localtunnel: npx localtunnel --port 3000');
      }
    } else {
      console.warn('⚠️  WEB_APP_URL sozlanmagan. Menu button sozlanmaydi.');
    }

    // Choose webhook or polling
    if (USE_WEBHOOK && WEBHOOK_URL) {
      console.log('🔗 Webhook rejimi...');
      await deleteWebhook(); // Delete old webhook first
      await setWebhook(WEBHOOK_URL);
      console.log('✅ Webhook sozlandi. Bot tayyor!');
      console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
    } else {
      console.log('🔄 Long polling rejimi...');
      console.log('💡 Webhook ishlatish uchun .env faylida USE_WEBHOOK=true va WEBHOOK_URL ni sozlang.\n');
      await deleteWebhook(); // Make sure webhook is deleted
      await startPolling();
    }
  } catch (error) {
    console.error('❌ Bot ishga tushirishda xato:', error);
    console.warn('⚠️  Bot ishlamayapti, lekin Web App ishlayapti.');
    // Don't exit, let Web App continue working
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Xatolik:', error);
});

process.on('SIGINT', async () => {
  console.log('\n👋 Bot to\'xtatilmoqda...');
  await deleteWebhook();
  process.exit(0);
});

// Start bot (Web App will work even if bot fails)
main().catch((error) => {
  console.error('❌ Umumiy xatolik:', error);
  console.warn('⚠️  Bot ishlamayapti, lekin Web App ishlayapti.');
  // Don't exit - Web App should continue working
});

