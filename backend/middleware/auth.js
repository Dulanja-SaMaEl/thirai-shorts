import { supabaseAdmin } from '../config/supabase.js';

export const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Missing authentication token.' });
      }

      const token = authHeader.split(' ')[1];

      // Handle Fail-Safe Demo Tokens for testing
      if (token.startsWith('demo-token-admin')) {
        req.user = {
          id: 'a0000000-0000-0000-0000-000000000001',
          email: 'admin@thiraiplus.com',
          full_name: 'Executive Admin',
          role: 'admin',
          username: 'admin'
        };
        return next();
      }

      if (token.startsWith('demo-token-judge')) {
        req.user = {
          id: 'j0000000-0000-0000-0000-000000000002',
          email: 'judge@thiraiplus.com',
          full_name: 'Judge Steven Spielberg',
          role: 'judge',
          username: 'judge_steven'
        };
        return next();
      }

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired session token.' });
      }

      // Retrieve user role from Supabase DB or auth metadata
      const { data: dbUser, error: userErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (userErr || !dbUser) {
        return res.status(403).json({ error: 'User profile not found.' });
      }

      // Check user role permission
      if (roles.length > 0 && !roles.includes(dbUser.role)) {
        return res.status(403).json({ error: `Forbidden. Role '${dbUser.role}' lacks permission for this resource.` });
      }

      req.user = dbUser;
      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err);
      res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  };
};
