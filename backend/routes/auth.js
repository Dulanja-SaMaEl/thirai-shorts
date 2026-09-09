import express from 'express';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { userStore, DEMO_USERS } from '../config/userStore.js';
import { signToken, verifyToken } from '../config/jwt.js';

const router = express.Router();

// Rate limiter to prevent brute-force attacks on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Too many login or registration attempts. Please try again in 15 minutes.' }
});

// Helper: Run promise with timeout to avoid hanging network calls
const withTimeout = (promise, ms = 4000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database request timeout')), ms))
  ]);
};

/**
 * @route POST /api/auth/register
 * @desc Securely register a new viewer account with 2 free short film viewing tokens
 */
router.post('/register', authLimiter, async (req, res) => {
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

    // Check if user already exists in Supabase public.users
    if (isSupabaseConfigured) {
      try {
        const { data: existingDbUser } = await withTimeout(
          supabaseAdmin.from('users').select('id').eq('email', cleanEmail).maybeSingle()
        );
        if (existingDbUser) {
          return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
        }
      } catch (e) {
        console.warn('Supabase duplicate email check note:', e.message);
      }
    }

    // Securely hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    let userId = `user-${Date.now()}`;

    // Attempt Supabase Native Auth creation if configured
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authErr } = await withTimeout(
          supabaseAdmin.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: full_name.trim(),
                role: 'viewer',
                tokens_balance: 2
              }
            }
          })
        );

        if (!authErr && authData?.user) {
          userId = authData.user.id;
        }
      } catch (e) {
        console.warn('Supabase auth signup notice:', e.message);
      }
    }

    // Strict role safety: registration always sets 'viewer' role (prevent privilege escalation)
    const profileData = {
      id: userId,
      email: cleanEmail,
      full_name: full_name.trim(),
      role: 'viewer',
      tokens_balance: 2, // Gift 2 free tokens for new viewers
      subscription_tier: 'free',
      subscription_status: 'inactive',
      username: cleanEmail.split('@')[0],
      profile_pic_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };

    // Sync user record to Supabase public.users
    if (isSupabaseConfigured) {
      try {
        await withTimeout(
          supabaseAdmin.from('users').upsert(profileData, { onConflict: 'email' })
        );
      } catch (dbErr) {
        console.warn('Supabase DB users upsert notice:', dbErr.message);
      }
    }

    // Register user in local memory store
    const registeredUser = userStore.registerUser({
      email: cleanEmail,
      password,
      full_name: full_name.trim(),
      role: 'viewer',
      tokens_balance: 2
    });
    registeredUser.id = userId;

    // Issue cryptographically signed server JWT
    const authToken = signToken({
      id: userId,
      email: cleanEmail,
      role: 'viewer',
      full_name: profileData.full_name
    });

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
 * @desc Production Login Portal with zero security bypass and cryptographic JWT issuance
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email/username and password.' });
    }

    let targetEmail = email.trim().toLowerCase();

    // Map common shortcuts to canonical emails
    if (!targetEmail.includes('@')) {
      if (targetEmail === 'admin') targetEmail = 'admin@thiraiplus.com';
      else if (targetEmail === 'judge_steven' || targetEmail === 'judge') targetEmail = 'judge@thiraiplus.com';
      else if (targetEmail === 'cine_fan' || targetEmail === 'viewer') targetEmail = 'viewer@thiraiplus.com';
      else if (targetEmail === 'director') targetEmail = 'director@thiraiplus.com';
      else targetEmail = `${targetEmail}@thiraiplus.com`;
    }

    let authenticatedUser = null;

    // 1. Direct Database Password Hash Check (via public.users table in Supabase) - FAST PATH
    if (isSupabaseConfigured) {
      try {
        const { data: dbUser } = await withTimeout(
          supabaseAdmin.from('users').select('*').eq('email', targetEmail).maybeSingle(),
          3000
        );

        if (dbUser && dbUser.password_hash) {
          const isMatch = await bcrypt.compare(password, dbUser.password_hash);
          if (isMatch) {
            authenticatedUser = dbUser;
          } else {
            // Explicit password mismatch in DB -> Reject immediately without waiting for slow GoTrue timeout
            return res.status(401).json({ error: 'Invalid email/username or password.' });
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB password check notice:', dbErr.message);
      }
    }

    // 2. Supabase GoTrue Auth Check (for users created natively via Supabase GoTrue Auth)
    if (!authenticatedUser && isSupabaseConfigured) {
      try {
        const { data: authData, error: authErr } = await withTimeout(
          supabaseAdmin.auth.signInWithPassword({ email: targetEmail, password }),
          4000
        );

        if (!authErr && authData?.user) {
          // Fetch linked profile from public.users
          const { data: profile } = await withTimeout(
            supabaseAdmin.from('users').select('*').eq('email', targetEmail).maybeSingle(),
            3000
          );

          authenticatedUser = profile || {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || targetEmail.split('@')[0],
            role: authData.user.user_metadata?.role || 'viewer',
            tokens_balance: authData.user.user_metadata?.tokens_balance ?? 2,
            subscription_tier: 'free',
            subscription_status: 'inactive'
          };
        }
      } catch (authErr) {
        console.warn('Live Supabase Auth check note:', authErr.message);
      }
    }

    // 3. Check Seeded Accounts & Registered In-Memory Users (with strict password validation)
    if (!authenticatedUser) {
      const userRecord = userStore.getUserByEmail(targetEmail);
      if (userRecord) {
        const isMatch = await userStore.verifyPassword(targetEmail, password);
        if (isMatch) {
          authenticatedUser = userRecord.user;
          // Synchronize latest DB balance if available
          if (isSupabaseConfigured) {
            try {
              const { data: liveData } = await withTimeout(
                supabaseAdmin.from('users').select('tokens_balance, subscription_status, subscription_tier').eq('email', targetEmail).maybeSingle(),
                2000
              );
              if (liveData) {
                authenticatedUser = { ...authenticatedUser, ...liveData };
              }
            } catch (e) {}
          }
        } else {
          // Explicit password mismatch -> Reject immediately
          return res.status(401).json({ error: 'Invalid email/username or password.' });
        }
      }
    }

    // 4. If no authentication succeeded, reject with 401 (Zero security bypass)
    if (!authenticatedUser) {
      return res.status(401).json({
        error: 'Invalid email/username or password. If you do not have an account, please register.'
      });
    }

    // 5. Issue cryptographic server JWT
    const token = signToken({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      full_name: authenticatedUser.full_name
    });

    userStore.createSession(token, authenticatedUser);

    return res.status(200).json({
      success: true,
      token,
      user: authenticatedUser
    });

  } catch (error) {
    console.error('Login Endpoint Error:', error);
    return res.status(500).json({ error: 'Authentication failed due to an unexpected server error.' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user session profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify Cryptographic Server JWT
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      let profile = null;

      if (isSupabaseConfigured) {
        try {
          const { data } = await withTimeout(
            supabaseAdmin.from('users').select('*').eq('id', decoded.id).maybeSingle(),
            3000
          );
          if (data) profile = data;
        } catch (e) {}
      }

      if (!profile) {
        profile = userStore.getUserById(decoded.id) || userStore.getUserByEmail(decoded.email)?.user;
      }

      const user = profile || {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        full_name: decoded.full_name || decoded.email.split('@')[0],
        tokens_balance: decoded.role === 'admin' || decoded.role === 'judge' ? 999 : 2,
        subscription_status: 'inactive',
        subscription_tier: 'free'
      };

      return res.status(200).json({ success: true, user });
    }

    // 2. Native Supabase Auth Token verification
    if (isSupabaseConfigured) {
      try {
        const { data: { user: sbUser }, error: sbErr } = await supabaseAdmin.auth.getUser(token);
        if (!sbErr && sbUser) {
          const { data: profile } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', sbUser.id)
            .single();

          return res.status(200).json({
            success: true,
            user: profile || {
              id: sbUser.id,
              email: sbUser.email,
              role: sbUser.user_metadata?.role || 'viewer',
              tokens_balance: 2
            }
          });
        }
      } catch (e) {}
    }

    return res.status(401).json({ error: 'Session expired or invalid token.' });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

export default router;
