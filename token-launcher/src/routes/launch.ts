import express, { Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { handleDebugLaunch, handleFullLaunch } from '../agent/agentController.js';

const router = express.Router();

// Debug endpoint - test agent without launching
router.post('/debug', handleDebugLaunch);

// Full launch endpoint (with optional image) - use multer with optional file
// This allows both with and without image uploads
router.post('/launch', upload.single('image'), handleFullLaunch);

// Fallback launch without multer for JSON-only requests
router.post('/launch-json', handleFullLaunch);

export default router;
