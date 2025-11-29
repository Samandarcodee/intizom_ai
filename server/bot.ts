import type { IncomingMessage, ServerResponse } from 'http';
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
const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = env.WEB_APP_URL || process.env.WEB_APP_URL || 'https://your-domain.com';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN topilmadi! .env faylida TELEGRAM_BOT_TOKEN ni sozlang.');
  process.exit(1);
}

// Check if URL is HTTPS
function isHttpsUrl(url: string): boolean {
  return url.startsWith('https://');
}

// Check if URL is valid for Telegram Web App
function isValidWebAppUrl(url: string): boolean {
  return url && url !== 'https://your-domain.com' && isHttpsUrl(url);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      message_id: number;
    };
    data?: string;
  };
}

/**
 * Send message to Telegram chat
 */
async function sendMessage(chatId: number, text: string, options?: {
  reply_markup?: any;
  parse_mode?: string;
}) {
  try {
    const payload: any = {
      chat_id: chatId,
      text,
    };

    if (options?.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    if (options?.parse_mode) {
      payload.parse_mode = options.parse_mode;
    }

    console.log(`📤 Xabar yuborilmoqda: chatId=${chatId}, text length=${text.length}`);

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('❌ Xabar yuborishda xato:', JSON.stringify(data, null, 2));
      console.error('📤 Yuborilgan payload:', JSON.stringify(payload, null, 2));
    } else {
      console.log('✅ Xabar muvaffaqiyatli yuborildi');
    }
    return data;
  } catch (error) {
    console.error('❌ Xabar yuborishda xato:', error);
    throw error;
  }
}

/**
 * Set webhook
 */
async function setWebhook(url: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Webhook sozlandi:', url);
    } else {
      console.error('❌ Webhook sozlashda xato:', data);
    }
    return data;
  } catch (error) {
    console.error('❌ Webhook sozlashda xato:', error);
    throw error;
  }
}

/**
 * Delete webhook
 */
async function deleteWebhook() {
  try {
    const response = await fetch(`${TELEGRAM_API}/deleteWebhook`);
    const data = await response.json();
    if (data.ok) {
      console.log('✅ Webhook o\'chirildi');
    }
    return data;
  } catch (error) {
    console.error('❌ Webhook o\'chirishda xato:', error);
    throw error;
  }
}

/**
 * Get bot info
 */
async function getMe() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getMe`);
    const data = await response.json();
    if (data.ok) {
      console.log('✅ Bot ma\'lumotlari:', data.result);
      return data.result;
    } else {
      console.error('❌ Bot ma\'lumotlarini olishda xato:', data);
    }
    return null;
  } catch (error) {
    console.error('❌ Bot ma\'lumotlarini olishda xato:', error);
    return null;
  }
}

/**
 * Set menu button with Web App
 */
async function setMenuButton(chatId?: number) {
  // Only set menu button if URL is HTTPS
  if (!isValidWebAppUrl(WEB_APP_URL)) {
    console.warn(`⚠️  Menu button sozlanmaydi: WEB_APP_URL HTTPS bo'lishi kerak (hozir: ${WEB_APP_URL})`);
    console.warn('💡 Development uchun ngrok yoki localtunnel ishlatishingiz mumkin');
    return { ok: false, skipped: true };
  }

  try {
    const menuButton = {
      type: 'web_app',
      text: '🚀 AI-INTIZOM',
      web_app: {
        url: WEB_APP_URL,
      },
    };

    const response = await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: menuButton,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      console.log('✅ Menu button sozlandi');
    } else {
      console.error('❌ Menu button sozlashda xato:', data);
    }
    return data;
  } catch (error) {
    console.error('❌ Menu button sozlashda xato:', error);
    throw error;
  }
}

/**
 * Handle /start command
 */
async function handleStart(chatId: number, firstName: string) {
  let welcomeMessage = `👋 Salom, ${firstName}!

🎯 <b>AI-INTIZOM</b> - bu sizning shaxsiy intizom va rivojlanish yordamchingiz.

📱 <b>Qanday ishlaydi?</b>
• Odatlar yarating va kundalik vazifalarni bajarishni kuzating
• AI murabbiy bilan suhbatlashib, motivatsiya oling
• Maqsadlar uchun rejalar tuzing
• Focus timer bilan ehtiyojsiz vaqtni kamaytiring`;

  // Only add Web App button if URL is HTTPS
  if (isValidWebAppUrl(WEB_APP_URL)) {
    welcomeMessage += '\n\n🚀 <b>Boshlash uchun</b> quyidagi tugmani bosing:';
    
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 AI-INTIZOM ni ochish',
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    };

    await sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    });
  } else {
    welcomeMessage += `\n\n⚠️ Web App hozircha mavjud emas (development rejimi).`;
    welcomeMessage += `\n\n📝 Production deploy qilingandan keyin Web App ishlaydi.`;
    
    await sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
    });
  }
}

/**
 * Handle /help command
 */
async function handleHelp(chatId: number) {
  const helpMessage = `📖 <b>Yordam</b>

<b>Buyruqlar:</b>
/start - Botni ishga tushirish
/help - Yordam olish
/app - Web App ni ochish

<b>Web App xususiyatlari:</b>
• 📊 Dashboard - kundalik statistika
• ✅ Odatlar - odatlarni boshqarish
• 📅 Reja - maqsadlar uchun rejalar
• 💬 AI Murabbiy - AI bilan suhbat
• ⚙️ Sozlamalar - hisob sozlamalari

Savollar bo'lsa, @intizomAi_bot ga yozing!`;

  await sendMessage(chatId, helpMessage, {
    parse_mode: 'HTML',
  });
}

/**
 * Handle /app command
 */
async function handleApp(chatId: number) {
  if (isValidWebAppUrl(WEB_APP_URL)) {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 AI-INTIZOM ni ochish',
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    };

    await sendMessage(chatId, '🚀 AI-INTIZOM Web App ni ochish uchun quyidagi tugmani bosing:', {
      reply_markup: keyboard,
    });
  } else {
    await sendMessage(
      chatId,
      `⚠️ Web App hozircha mavjud emas.\n\nURL: ${WEB_APP_URL}\n\n💡 Production deploy qilingandan keyin Web App ishlaydi.`
    );
  }
}

/**
 * Process incoming update
 */
async function processUpdate(update: TelegramUpdate) {
  console.log('📨 Yangi update qabul qilindi:', update.update_id);
  
  if (update.message) {
    const { chat, from, text } = update.message;
    const chatId = chat.id;
    const firstName = from.first_name;

    console.log(`💬 Xabar: chatId=${chatId}, from=${firstName}, text="${text}"`);

    if (text) {
      // Remove bot username from command if present (e.g., /start@botname -> /start)
      let command = text.toLowerCase().trim().split('@')[0].split(' ')[0];
      console.log(`🔍 Buyruq aniqlandi: "${command}" (original: "${text}")`);

      try {
        if (command === '/start') {
          console.log(`✅ /start buyrug'i bajarilmoqda...`);
          await handleStart(chatId, firstName);
          console.log(`✅ /start buyrug'i bajarildi`);
        } else if (command === '/help') {
          console.log(`✅ /help buyrug'i bajarilmoqda...`);
          await handleHelp(chatId);
          console.log(`✅ /help buyrug'i bajarildi`);
        } else if (command === '/app') {
          console.log(`✅ /app buyrug'i bajarilmoqda...`);
          await handleApp(chatId);
          console.log(`✅ /app buyrug'i bajarildi`);
        } else {
          // Unknown command
          console.log(`❓ Noma'lum buyruq: "${command}"`);
          await sendMessage(
            chatId,
            `❓ Noma'lum buyruq. /help buyrug'i bilan yordam oling.`
          );
        }
      } catch (error) {
        console.error('❌ Buyruqni bajarishda xato:', error);
        // Try to send error message to user
        try {
          await sendMessage(chatId, `❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.`);
        } catch (e) {
          console.error('❌ Xatolik xabarini yuborishda muammo:', e);
        }
      }
    } else {
      console.log(`⚠️  Xabar matni yo'q`);
    }
  } else {
    console.log(`⚠️  Update message yo'q`);
  }

  if (update.callback_query) {
    // Handle callback queries if needed
    console.log('🔄 Callback query:', update.callback_query);
  }
}

/**
 * Webhook handler for serverless functions
 */
export async function webhookHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const update: TelegramUpdate = JSON.parse(body);
        await processUpdate(update);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Webhook handler xatosi:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(error) }));
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
}

/**
 * Long polling (for development)
 */
export async function startPolling() {
  console.log('🔄 Long polling ishga tushmoqda...');
  console.log(`📡 Telegram API: ${TELEGRAM_API.replace(BOT_TOKEN, 'TOKEN_HIDDEN')}`);
  
  let offset = 0;

  while (true) {
    try {
      const url = `${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=10&allowed_updates=["message"]`;
      console.log(`🔍 Updates so'ralmoqda (offset=${offset})...`);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.ok) {
        console.error('❌ Telegram API xatosi:', data);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      if (data.result && data.result.length > 0) {
        console.log(`📨 ${data.result.length} ta yangi update qabul qilindi`);
        for (const update of data.result) {
          await processUpdate(update);
          offset = update.update_id + 1;
        }
      } else {
        // No updates, continue polling
        console.log(`⏳ Yangi xabarlar yo'q, kutmoqda...`);
      }
    } catch (error) {
      console.error('❌ Polling xatosi:', error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
    }
  }
}

// Export functions
export {
  sendMessage,
  setWebhook,
  deleteWebhook,
  getMe,
  setMenuButton,
  handleStart,
  handleHelp,
  handleApp,
  processUpdate,
  BOT_TOKEN,
  WEB_APP_URL,
};

