import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { webhookHandler } from './bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON (for webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory (production build)
const distPath = join(rootDir, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Static files serving from dist/');
  console.log(`📁 Dist path: ${distPath}`);
} else {
  console.warn('⚠️  dist/ directory not found. Run "npm run build" first.');
  console.warn(`📁 Looking for dist at: ${distPath}`);
  console.warn(`📁 Root directory: ${rootDir}`);
  console.warn(`📁 Current working directory: ${process.cwd()}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    distExists: existsSync(distPath),
    distPath: distPath,
    timestamp: new Date().toISOString()
  });
});

// Telegram webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    // Convert Express request to Node.js IncomingMessage format
    const mockReq = {
      method: 'POST',
      on: (event: string, callback: (chunk?: any) => void) => {
        if (event === 'data') {
          callback(JSON.stringify(req.body));
        } else if (event === 'end') {
          callback();
        }
      }
    } as any;
    
    const mockRes = {
      writeHead: (status: number, headers: any) => {
        res.status(status);
        Object.keys(headers).forEach(key => {
          res.setHeader(key, headers[key]);
        });
      },
      end: (data: string) => {
        res.send(data);
      }
    } as any;
    
    await webhookHandler(mockReq, mockRes);
  } catch (error) {
    console.error('❌ Webhook endpoint xatosi:', error);
    res.status(500).json({ ok: false, error: String(error) });
  }
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  console.log(`📄 Request: ${req.path}, checking: ${indexPath}`);
  if (existsSync(indexPath)) {
    console.log(`✅ Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    console.warn(`❌ index.html not found at: ${indexPath}`);
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI-INTIZOM - Building...</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #0f0f0f;
              color: #fff;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { color: #3b82f6; }
            p { color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 AI-INTIZOM</h1>
            <p>Web App is being built...</p>
            <p>Please run "npm run build" to build the application.</p>
          </div>
        </body>
      </html>
    `);
  }
});

export function startWebServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web App server ishga tushdi: http://0.0.0.0:${PORT}`);
    console.log(`📱 Webhook URL: http://0.0.0.0:${PORT}/webhook`);
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(`🌐 Production URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}/`);
      console.log(`📡 Webhook URL: https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`);
    }
  });
  
  return server;
}

