import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { verifyToken } from '../config/jwt.js';
import { userStore } from '../config/userStore.js';

export const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Missing authentication token.' });
      }

      const token = authHeader.split(' ')[1];

      // 1. Verify Cryptographic Server JWT
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        let user = null;

        // Fetch latest profile from Supabase if connected
        if (isSupabaseConfigured) {
          try {
            const { data: dbUser } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', decoded.id)
              .maybeSingle();
            if (dbUser) user = dbUser;
          } catch (e) {
            console.warn('Supabase profile fetch notice in auth middleware:', e.message);
          }
        }

        // Fallback to runtime store if DB didn't return or was offline
        if (!user) {
          user = userStore.getUserById(decoded.id) || (decoded.email ? userStore.getUserByEmail(decoded.email)?.user : null);
        }

        // If user still not found, construct safe verified profile from valid JWT claims
        if (!user) {
          user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'viewer',
            full_name: decoded.full_name || decoded.email.split('@')[0],
            tokens_balance: decoded.role === 'admin' || decoded.role === 'judge' ? 999 : 2
          };
        }

        // Enforce strict role authorization
        if (roles.length > 0 && !roles.includes(user.role)) {
          return res.status(403).json({
            error: `Forbidden. Role '${user.role}' lacks permission for this action.`
          });
        }

        req.user = user;
        return next();
      }

      // 2. Verify Native Supabase Auth Token (if client authenticated directly with Supabase)
      if (isSupabaseConfigured) {
        try {
          const { data: { user: sbUser }, error: sbErr } = await supabaseAdmin.auth.getUser(token);

          if (!sbErr && sbUser) {
            const { data: dbProfile } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('email', sbUser.email)
              .maybeSingle();

            const resolvedUser = dbProfile || {
              id: sbUser.id,
              email: sbUser.email,
              role: sbUser.user_metadata?.role || 'viewer',
              full_name: sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
              tokens_balance: sbUser.user_metadata?.tokens_balance ?? 2
            };

            if (roles.length > 0 && !roles.includes(resolvedUser.role)) {
              return res.status(403).json({
                error: `Forbidden. Role '${resolvedUser.role}' lacks permission for this action.`
              });
            }

            req.user = resolvedUser;
            return next();
          }
        } catch (sbEx) {
          console.warn('Native Supabase token verification check notice:', sbEx.message);
        }
      }

      // 3. Reject any forged, expired, or invalid token
      return res.status(401).json({
        error: 'Invalid, expired, or unauthenticated session token. Please log in again.'
      });

    } catch (err) {
      console.error('Auth Middleware Critical Error:', err);
      return res.status(500).json({ error: 'Internal server error during authentication verification.' });
    }
  };
};
