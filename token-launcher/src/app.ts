import express from 'express';
import dotenv from 'dotenv';
import launchRoutes from './routes/launch.js';
import tokenRoutes from './routes/token.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Create tmp directory
const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multipart form data
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});
app.use(upload.single('image'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Serve static files from public
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - serve chat interface
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../public/token-launcher.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      status: 'ok', 
      message: 'LIZA Token Launcher Backend',
      endpoints: {
        api_token_create: 'POST /api/token/create',
        api_token_status: 'GET /api/token/status/:mint',
        api_agent_launch: 'POST /api/agent/launch',
        health: 'GET /health'
      }
    });
  }
});

// Routes
app.use('/api/agent', launchRoutes);
app.use('/api/token', tokenRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;
