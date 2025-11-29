import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web App server ishga tushdi: http://0.0.0.0:${PORT}`);
    console.log(`📱 Production URL: https://intizomai-production.up.railway.app/`);
  });
}

