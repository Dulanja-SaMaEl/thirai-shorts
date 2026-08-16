import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { antiSpamVoterCheck } from '../middleware/antiSpam.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * @route GET /api/vote/timer-status
 * @desc Get current Community Rating Timer status for public homepage
 */
router.get('/timer-status', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'community_rating_event')
      .single();

    if (error || !data) {
      return res.status(200).json({
        success: true,
        setting: { is_active: false, end_time: null }
      });
    }

    return res.status(200).json({
      success: true,
      setting: data.value
    });
  } catch (error) {
    console.error('Error fetching timer status:', error);
    return res.status(500).json({ error: 'Failed to retrieve community timer status.' });
  }
});

/**
 * @route POST /api/vote/request-otp
 * @desc Submit vote request: Validates email anti-spam, checks duplicate, sends OTP code
 */
router.post('/request-otp', antiSpamVoterCheck, async (req, res) => {
  try {
    const { movie_id, rating } = req.body;
    const voter_email = req.cleanVoterEmail;

    if (!movie_id || !rating) {
      return res.status(400).json({ error: 'movie_id and rating are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10.' });
    }

    // Check if Community Rating Event is active
    const { data: timerSetting } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'community_rating_event')
      .single();

    if (!timerSetting || !timerSetting.value?.is_active) {
      return res.status(403).json({ error: 'Community rating event is currently closed.' });
    }

    if (timerSetting.value?.end_time && new Date(timerSetting.value.end_time) < new Date()) {
      return res.status(403).json({ error: 'Community rating event has ended.' });
    }

    // 1. Anti-Spam Check: Check if email has already voted for this movie
    const { data: existingVote, error: checkErr } = await supabaseAdmin
      .from('community_votes')
      .select('id, is_verified')
      .eq('movie_id', movie_id)
      .eq('voter_email', voter_email)
      .single();

    if (existingVote && existingVote.is_verified) {
      return res.status(400).json({ 
        error: 'You have already submitted a verified vote for this movie. Only one vote per email address is allowed.' 
      });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Upsert vote record with unverified state and OTP
    const { error: voteErr } = await supabaseAdmin
      .from('community_votes')
      .upsert({
        movie_id,
        voter_email,
        rating: numRating,
        otp_code: otpCode,
        is_verified: false,
        ip_address: clientIp,
        created_at: new Date().toISOString()
      }, { onConflict: 'movie_id,voter_email' });

    if (voteErr) throw voteErr;

    // Simulate / Log OTP dispatch (In production: send via Nodemailer, SendGrid, or Resend)
    console.log(`[ANTI-SPAM OTP DISPATCH] Sent OTP [${otpCode}] to ${voter_email} for movie ${movie_id}`);

    return res.status(200).json({
      success: true,
      message: `OTP verification code sent to ${voter_email}. Please enter the 6-digit OTP to confirm your rating.`,
      // For demo testing ease, we return otp_code in response header/data if process.env.NODE_ENV !== 'production'
      dev_otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    });

  } catch (error) {
    console.error('Error processing community vote request:', error);
    return res.status(500).json({ error: 'Failed to process vote request.' });
  }
});

/**
 * @route POST /api/vote/verify-otp
 * @desc Verify OTP code to confirm community rating
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { movie_id, voter_email, otp_code } = req.body;

    if (!movie_id || !voter_email || !otp_code) {
      return res.status(400).json({ error: 'movie_id, voter_email, and otp_code are required.' });
    }

    const cleanEmail = voter_email.trim().toLowerCase();

    // Query unverified vote record
    const { data: vote, error } = await supabaseAdmin
      .from('community_votes')
      .select('*')
      .eq('movie_id', movie_id)
      .eq('voter_email', cleanEmail)
      .single();

    if (error || !vote) {
      return res.status(404).json({ error: 'No pending vote found for this email address.' });
    }

    if (vote.is_verified) {
      return res.status(400).json({ error: 'This vote has already been verified.' });
    }

    if (vote.otp_code !== otp_code.trim()) {
      return res.status(400).json({ error: 'Invalid OTP verification code. Please try again.' });
    }

    // Confirm vote verification
    const { data: verifiedVote, error: updateErr } = await supabaseAdmin
      .from('community_votes')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        otp_code: null
      })
      .eq('id', vote.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: 'Vote verified successfully! Thank you for participating in the festival rating.',
      vote: verifiedVote
    });

  } catch (error) {
    console.error('Error verifying vote OTP:', error);
    return res.status(500).json({ error: 'Failed to verify community rating vote.' });
  }
});

export default router;
