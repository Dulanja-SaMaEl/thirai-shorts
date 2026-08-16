import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { r2Client, R2_BUCKET_NAME } from '../config/r2.js';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Live System Diagnostics (Express Server, Supabase DB, Cloudflare R2 Storage)
 */
router.get('/', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: { status: 'online', message: 'Express Server live' },
    database: { status: 'checking', message: '' },
    cloudflareR2: { status: 'checking', message: '' },
    overall: 'healthy'
  };

  // 1. Supabase Database Ping Test
  try {
    const { data, error } = await supabaseAdmin
      .from('movies')
      .select('count', { count: 'exact', head: true });

    if (error) {
      diagnostics.database = { status: 'degraded', message: error.message };
      diagnostics.overall = 'degraded';
    } else {
      diagnostics.database = { status: 'online', message: 'PostgreSQL Database connected' };
    }
  } catch (err) {
    diagnostics.database = { status: 'offline', message: err.message || 'Database connection error' };
    diagnostics.overall = 'degraded';
  }

  // 2. Cloudflare R2 Bucket S3 Head Test
  try {
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes('your-')) {
      diagnostics.cloudflareR2 = { status: 'unconfigured', message: 'R2 API keys pending in .env' };
    } else {
      const command = new HeadBucketCommand({ Bucket: R2_BUCKET_NAME });
      await r2Client.send(command);
      diagnostics.cloudflareR2 = { status: 'online', message: `R2 Bucket '${R2_BUCKET_NAME}' verified` };
    }
  } catch (err) {
    diagnostics.cloudflareR2 = { status: 'degraded', message: err.message || 'R2 S3 handshake failed' };
    if (diagnostics.overall === 'healthy') diagnostics.overall = 'degraded';
  }

  return res.status(200).json(diagnostics);
});

export default router;
