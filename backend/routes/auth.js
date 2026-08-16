import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Preset Demo User Configurations for instant setup
const DEMO_USERS = {
  'admin@thiraiplus.com': {
    password: 'Admin@123456',
    full_name: 'Executive Admin',
    role: 'admin',
    username: 'admin',
    profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  'judge@thiraiplus.com': {
    password: 'Judge@123456',
    full_name: 'Judge Steven Spielberg',
    role: 'judge',
    username: 'judge_steven',
    profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login with Auto-Provisioning for Admin and Judge accounts
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Username and Password are required.' });
    }

    let targetEmail = email.trim().toLowerCase();

    // Map username to email if needed
    if (!targetEmail.includes('@')) {
      if (targetEmail === 'admin') targetEmail = 'admin@thiraiplus.com';
      else if (targetEmail === 'judge_steven' || targetEmail === 'judge') targetEmail = 'judge@thiraiplus.com';
      else {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('username', targetEmail)
          .single();
        if (dbUser) targetEmail = dbUser.email;
      }
    }

    // 1. Try standard Supabase Auth Login
    let { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    // 2. Auto-Provisioning Fallback if Auth User does not exist yet in Supabase Auth
    if (authErr) {
      const demoConfig = DEMO_USERS[targetEmail];
      
      // If it's a known demo user or registered user in custom table, auto-create in Supabase Auth
      if (demoConfig || targetEmail.endsWith('@thiraiplus.com')) {
        console.log(`⚡ Auto-provisioning user in Supabase Auth: ${targetEmail}`);
        
        // Create user in Supabase Auth with admin privileges
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: password,
          email_confirm: true,
        });

        if (!createErr && newUser.user) {
          const userMeta = demoConfig || {
            full_name: targetEmail.split('@')[0],
            role: targetEmail.includes('admin') ? 'admin' : 'judge',
            username: targetEmail.split('@')[0]
          };

          // Upsert into custom public.users table
          await supabaseAdmin.from('users').upsert({
            id: newUser.user.id,
            email: targetEmail,
            full_name: userMeta.full_name,
            role: userMeta.role,
            username: userMeta.username,
            profile_pic_url: userMeta.profile_pic_url || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });

          // Retry authentication after creation
          const retryAuth = await supabaseAdmin.auth.signInWithPassword({
            email: targetEmail,
            password,
          });

          if (retryAuth.data?.session) {
            authData = retryAuth.data;
            authErr = null;
          }
        }
      }
    }

    if (authErr || !authData?.user) {
      return res.status(401).json({ 
        error: 'Invalid credentials. Please verify email and password.' 
      });
    }

    // 3. Fetch user profile from public.users
    let { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // If profile missing in public.users, create default profile
    if (!profile) {
      const defaultRole = targetEmail.includes('admin') ? 'admin' : 'judge';
      const { data: createdProfile } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: targetEmail,
          full_name: targetEmail.includes('admin') ? 'Executive Admin' : 'Jury Member',
          role: defaultRole,
          username: targetEmail.split('@')[0]
        })
        .select()
        .single();
      profile = createdProfile;
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
