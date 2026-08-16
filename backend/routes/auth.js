import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login for Admin and Judge portals
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Username and Password are required.' });
    }

    let targetEmail = email.trim();

    // If input looks like username instead of email, lookup email from users table
    if (!targetEmail.includes('@')) {
      const { data: dbUser, error: userErr } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('username', targetEmail)
        .single();

      if (userErr || !dbUser) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      targetEmail = dbUser.email;
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authErr || !authData.user) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }

    // Retrieve user record from custom users table
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(403).json({ error: 'User profile not found in system directory.' });
    }

    return res.status(200).json({
      success: true,
      token: authData.session.access_token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        username: profile.username,
        profile_pic_url: profile.profile_pic_url
      }
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
