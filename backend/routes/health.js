import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { r2Client, R2_BUCKET_NAME } from '../config/r2.js';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

const router = express.Router();

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Healthcheck ping timeout')), ms))
  ]);
};

/**
 * @route GET /api/health
 * @desc Production Diagnostics (Express Server, Supabase DB, Storage, Uptime)
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const diagnostics = {
    status: 'online',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: { status: 'checking', message: '' },
    cloudflareR2: { status: 'checking', message: '' },
    latencyMs: 0
  };

  // 1. Supabase Database Connectivity
  if (!isSupabaseConfigured) {
    diagnostics.database = {
      status: 'pending_configuration',
      message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY awaiting production credentials'
    };
  } else {
    try {
      const { error } = await withTimeout(
        supabaseAdmin.from('movies').select('count', { count: 'exact', head: true }),
        2000
      );

      if (error) {
        diagnostics.database = { status: 'degraded', message: error.message };
      } else {
        diagnostics.database = { status: 'online', message: 'PostgreSQL Database synchronized' };
      }
    } catch (err) {
      diagnostics.database = { status: 'offline', message: err.message || 'Database connection error' };
    }
  }

  // 2. Cloudflare R2 Storage Connectivity
  try {
    if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes('your-')) {
      diagnostics.cloudflareR2 = { status: 'unconfigured', message: 'R2 storage credentials optional / pending' };
    } else {
      const command = new HeadBucketCommand({ Bucket: R2_BUCKET_NAME });
      await withTimeout(r2Client.send(command), 2000);
      diagnostics.cloudflareR2 = { status: 'online', message: `R2 Bucket '${R2_BUCKET_NAME}' active` };
    }
  } catch (err) {
    diagnostics.cloudflareR2 = { status: 'degraded', message: err.message || 'Storage check timeout' };
  }

  diagnostics.latencyMs = Date.now() - startTime;
  return res.status(200).json(diagnostics);
});

export default router;
