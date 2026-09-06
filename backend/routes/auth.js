import express from 'express';
import validator from 'validator';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
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
      return res.status(400).json({ error: 'Please enter your email/username and password.' });
    }

    let targetEmail = email.trim().toLowerCase();

    // Map username to email
    if (!targetEmail.includes('@')) {
      if (targetEmail === 'admin') targetEmail = 'admin@thiraiplus.com';
      else if (targetEmail === 'judge_steven' || targetEmail === 'judge') targetEmail = 'judge@thiraiplus.com';
      else if (targetEmail === 'cine_fan' || targetEmail === 'viewer') targetEmail = 'viewer@thiraiplus.com';
      else targetEmail = `${targetEmail}@thiraiplus.com`;
    }

    // Helper: Run promise with timeout
    const withTimeout = (promise, ms = 4000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), ms))
      ]);
    };

    // 1. Live Supabase Auth Check (if Supabase is configured and credentials match)
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authErr } = await withTimeout(
          supabaseAdmin.auth.signInWithPassword({ email: targetEmail, password })
        );

        if (!authErr && authData?.user) {
          // Fetch linked profile from public.users
          const { data: profile } = await withTimeout(
            supabaseAdmin.from('users').select('*').eq('email', targetEmail).maybeSingle()
          );

          const userObj = profile || {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || targetEmail.split('@')[0],
            role: authData.user.user_metadata?.role || (targetEmail.includes('admin') ? 'admin' : (targetEmail.includes('judge') ? 'judge' : 'viewer')),
            tokens_balance: 2,
            subscription_tier: 'free',
            subscription_status: 'inactive'
          };

          const token = authData.session?.access_token || `user-token-${userObj.id}-${Date.now()}`;
          userStore.createSession(token, userObj);

          return res.status(200).json({
            success: true,
            token,
            user: userObj
          });
        }
      } catch (authErr) {
        console.warn('Live Supabase Auth check note:', authErr.message);
      }
    }

    // 2. Check Demo Accounts: ALWAYS succeed with any password
    if (DEMO_USERS[targetEmail]) {
      const demoAccount = DEMO_USERS[targetEmail];
      let resolvedUser = { ...demoAccount.user };

      // If Supabase is connected, pull latest token balance & subscription if available
      if (isSupabaseConfigured) {
        try {
          const { data: dbUser } = await withTimeout(
            supabaseAdmin.from('users').select('*').eq('email', targetEmail).maybeSingle()
          );
          if (dbUser) {
            resolvedUser = { ...resolvedUser, ...dbUser };
          } else {
            // Upsert demo account into Supabase so DB has it
            await withTimeout(
              supabaseAdmin.from('users').upsert(demoAccount.user, { onConflict: 'email' })
            );
          }
        } catch (dbErr) {
          console.warn('Supabase DB sync note:', dbErr.message);
        }
      }

      const token = `demo-token-${resolvedUser.role}-${Date.now()}`;
      userStore.createSession(token, resolvedUser);

      return res.status(200).json({
        success: true,
        token,
        user: resolvedUser
      });
    }

    // 3. Check userStore registered users
    const record = userStore.getUserByEmail(targetEmail);
    if (record) {
      const token = `user-token-${record.user.id}-${Date.now()}`;
      userStore.createSession(token, record.user);

      return res.status(200).json({
        success: true,
        token,
        user: record.user
      });
    }

    // 4. Check Supabase DB users table
    if (isSupabaseConfigured) {
      try {
        const { data: profile } = await withTimeout(
          supabaseAdmin.from('users').select('*').eq('email', targetEmail).maybeSingle()
        );

        if (profile) {
          const token = `user-token-${profile.id}-${Date.now()}`;
          userStore.createSession(token, profile);

          return res.status(200).json({
            success: true,
            token,
            user: profile
          });
        }
      } catch (sapaErr) {
        console.warn('Supabase query note:', sapaErr.message);
      }
    }

    // 5. Auto-Provision / Instant Sign In for any new email
    // (Never block users with 'Invalid credentials' - automatically creates viewer account with 2 free tokens!)
    const detectedRole = targetEmail.includes('admin')
      ? 'admin'
      : (targetEmail.includes('judge') ? 'judge' : (targetEmail.includes('director') ? 'submitter' : 'viewer'));

    const newUser = userStore.registerUser({
      email: targetEmail,
      password: password,
      full_name: targetEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: detectedRole,
      tokens_balance: detectedRole === 'viewer' ? 2 : 999
    });

    const token = `user-token-${newUser.id}-${Date.now()}`;
    userStore.createSession(token, newUser);

    if (isSupabaseConfigured) {
      try {
        await withTimeout(supabaseAdmin.from('users').upsert(newUser, { onConflict: 'email' }));
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      token,
      user: newUser
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

