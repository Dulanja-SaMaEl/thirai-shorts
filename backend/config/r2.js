import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// Cloudflare R2 S3-Compatible Client Initialization
const r2AccountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'your-cloudflare-account-id';
const r2AccessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'your-r2-access-key';
const r2SecretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'your-r2-secret-key';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'thirai-plus-media';
export const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'https://pub-r2.thiraiplus.com';
