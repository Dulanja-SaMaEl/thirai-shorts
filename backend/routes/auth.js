import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Preset Demo User Configurations for guaranteed portal access
const DEMO_USERS = {
  'admin@thiraiplus.com': {
    password: 'Admin@123456',
    user: {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@thiraiplus.com',
      full_name: 'Executive Admin',
      role: 'admin',
      username: 'admin',
      profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  },
  'judge@thiraiplus.com': {
    password: 'Judge@123456',
    user: {
      id: 'j0000000-0000-0000-0000-000000000002',
      email: 'judge@thiraiplus.com',
      full_name: 'Judge Steven Spielberg',
      role: 'judge',
      username: 'judge_steven',
      profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  }
};

/**
 * @route POST /api/auth/login
 * @desc Fail-Safe Login Portal (Handles live Supabase Auth & Instant Demo Bypass)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Username and Password are required.' });
    }

    let targetEmail = email.trim().toLowerCase();

    // Map username to email
    if (!targetEmail.includes('@')) {
      if (targetEmail === 'admin') targetEmail = 'admin@thiraiplus.com';
      else if (targetEmail === 'judge_steven' || targetEmail === 'judge') targetEmail = 'judge@thiraiplus.com';
    }

    const demoAccount = DEMO_USERS[targetEmail];

    // Check if password matches demo account
    if (demoAccount && password === demoAccount.password) {
      // Try to sync/upsert with Supabase DB silently if available
      try {
        await supabaseAdmin.from('users').upsert(demoAccount.user, { onConflict: 'email' });
      } catch (dbErr) {
        console.warn('Supabase DB sync warning:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        token: `demo-token-${demoAccount.user.role}-${Date.now()}`,
        user: demoAccount.user
      });
    }

    // Standard Supabase Auth Flow for production custom users
    try {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (!authErr && authData?.user) {
        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        return res.status(200).json({
          success: true,
          token: authData.session.access_token,
          user: profile || {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.email.split('@')[0],
            role: targetEmail.includes('admin') ? 'admin' : 'judge'
          }
        });
      }
    } catch (sapaErr) {
      console.error('Supabase Auth error:', sapaErr);
    }

    return res.status(401).json({
      error: 'Invalid credentials. Please check your email and password.'
    });

  } catch (error) {
    console.error('Login Endpoint Error:', error);
    return res.status(500).json({ error: 'Authentication failed due to server error.' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (token.startsWith('demo-token-admin')) {
      return res.status(200).json({ success: true, user: DEMO_USERS['admin@thiraiplus.com'].user });
    }
    if (token.startsWith('demo-token-judge')) {
      return res.status(200).json({ success: true, user: DEMO_USERS['judge@thiraiplus.com'].user });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.status(200).json({
      success: true,
      user: profile || { email: user.email, role: 'submitter' }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

export default router;
