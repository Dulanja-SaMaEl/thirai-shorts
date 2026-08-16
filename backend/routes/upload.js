import express from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from '../config/r2.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * @route POST /api/upload/presigned-url
 * @desc Generate presigned PUT URL for Cloudflare R2 direct video/image/file uploads
 * @access Public / Submitter
 */
router.post('/presigned-url', async (req, res) => {
  try {
    const { fileName, fileType, fileCategory } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required fields.' });
    }

    // Enforce video codec/type validation for video uploads
    if (fileCategory === 'video') {
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
      if (!allowedVideoTypes.includes(fileType.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Invalid video file format. Only MP4, WebM, and MOV video files are accepted.' 
        });
      }
    }

    // Enforce thumbnail format
    if (fileCategory === 'thumbnail') {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(fileType.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Invalid image file format. Only JPEG, PNG, and WebP images are accepted.' 
        });
      }
    }

    // Generate unique object key in R2
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const objectKey = `${fileCategory || 'general'}/${Date.now()}-${uniqueId}${fileExtension}`;

    // Prepare S3 PutObject Command
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });

    // Generate Presigned URL valid for 15 minutes (900 seconds)
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${objectKey}`;

    return res.status(200).json({
      success: true,
      presignedUrl,
      publicUrl,
      objectKey
    });

  } catch (error) {
    console.error('Error generating presigned R2 URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL.' });
  }
});

export default router;
