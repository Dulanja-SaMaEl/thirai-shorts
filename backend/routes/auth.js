import express from 'express';
import validator from 'validator';
import { supabaseAdmin } from '../config/supabase.js';
import { userStore, DEMO_USERS } from '../config/userStore.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new viewer account with 2 free short movie viewing tokens
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists in userStore
    const existingUser = userStore.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    let userId = `user-${Date.now()}`;
    let authToken = `user-token-${userId}-${Date.now()}`;

    // Attempt Supabase Auth creation if configured
    try {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: full_name.trim(),
            role: 'viewer',
            tokens_balance: 2
          }
        }
      });

      if (!authErr && authData?.user) {
        userId = authData.user.id;
        if (authData.session?.access_token) {
          authToken = authData.session.access_token;
        }
      }
    } catch (e) {
      console.warn('Supabase auth signup notice:', e.message);
    }

    // Sync with Supabase users table
    const profileData = {
      id: userId,
      email: cleanEmail,
      full_name: full_name.trim(),
      role: 'viewer',
      tokens_balance: 2, // Gift: 2 free tokens for viewing 2 short films
      username: cleanEmail.split('@')[0],
      profile_pic_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
    };

    try {
      await supabaseAdmin.from('users').upsert(profileData, { onConflict: 'email' });
    } catch (dbErr) {
      console.warn('Supabase DB users upsert notice:', dbErr.message);
    }

    // Register user in userStore for instant session management
    const registeredUser = userStore.registerUser({
      email: cleanEmail,
      password,
      full_name: full_name.trim(),
      role: 'viewer',
      tokens_balance: 2
    });
    registeredUser.id = userId;

    // Cache active session token
    userStore.createSession(authToken, registeredUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You have received 2 free movie viewing tokens.',
      token: authToken,
      user: registeredUser
    });

  } catch (error) {
    console.error('Registration Endpoint Error:', error);
    return res.status(500).json({ error: 'Registration failed due to server error.' });
  }
});

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
      else if (targetEmail === 'cine_fan' || targetEmail === 'viewer') targetEmail = 'viewer@thiraiplus.com';
    }

    // Check userStore registered users & demo users
    const record = userStore.getUserByEmail(targetEmail);
    if (record && password === record.password) {
      const token = `user-token-${record.user.id}-${Date.now()}`;
      userStore.createSession(token, record.user);

      // Silently sync with Supabase DB if possible
      try {
        await supabaseAdmin.from('users').upsert(record.user, { onConflict: 'email' });
      } catch (dbErr) {
        console.warn('Supabase DB sync warning:', dbErr.message);
      }

      return res.status(200).json({
        success: true,
        token,
        user: record.user
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

        const userObj = profile || {
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.email.split('@')[0],
          role: targetEmail.includes('admin') ? 'admin' : (targetEmail.includes('judge') ? 'judge' : 'viewer'),
          tokens_balance: 2
        };

        userStore.createSession(authData.session.access_token, userObj);

        return res.status(200).json({
          success: true,
          token: authData.session.access_token,
          user: userObj
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

    // Check userStore cache
    const cachedUser = userStore.getUserByToken(token);
    if (cachedUser) {
      return res.status(200).json({ success: true, user: cachedUser });
    }

    if (token.startsWith('demo-token-admin')) {
      return res.status(200).json({ success: true, user: DEMO_USERS['admin@thiraiplus.com'].user });
    }
    if (token.startsWith('demo-token-judge')) {
      return res.status(200).json({ success: true, user: DEMO_USERS['judge@thiraiplus.com'].user });
    }
    if (token.startsWith('demo-token-viewer')) {
      return res.status(200).json({ success: true, user: DEMO_USERS['viewer@thiraiplus.com'].user });
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
      user: profile || { email: user.email, role: 'viewer', tokens_balance: 2 }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

export default router;

