import crypto from 'crypto';

// Preset Demo User Configurations
export const DEMO_USERS = {
  'admin@thiraiplus.com': {
    password: 'Admin@123456',
    user: {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@thiraiplus.com',
      full_name: 'Executive Admin',
      role: 'admin',
      username: 'admin',
      tokens_balance: 999,
      subscription_tier: 'yearly',
      subscription_status: 'active',
      profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  },
  'judge@thiraiplus.com': {
    password: 'Judge@123456',
    user: {
      id: 'b0000000-0000-0000-0000-000000000002',
      email: 'judge@thiraiplus.com',
      full_name: 'Judge Steven Spielberg',
      role: 'judge',
      username: 'judge_steven',
      tokens_balance: 999,
      subscription_tier: 'yearly',
      subscription_status: 'active',
      profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  },
  'viewer@thiraiplus.com': {
    password: 'Viewer@123456',
    user: {
      id: 'd0000000-0000-0000-0000-000000000004',
      email: 'viewer@thiraiplus.com',
      full_name: 'Cinema Enthusiast',
      role: 'viewer',
      username: 'cine_fan',
      tokens_balance: 2,
      subscription_tier: 'free',
      subscription_status: 'inactive',
      profile_pic_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    }
  }
};

// In-Memory User Store (for development/fail-safe caching alongside Supabase DB)
const registeredUsersByEmail = new Map();
const registeredUsersById = new Map();
const sessionsByToken = new Map();

// In-Memory Movie Unlocks Store: Map<userId, Set<movieId>>
const movieUnlocksByUser = new Map();

// Initialize with Demo Users
for (const key of Object.keys(DEMO_USERS)) {
  const item = DEMO_USERS[key];
  registeredUsersByEmail.set(item.user.email.toLowerCase(), item);
  registeredUsersById.set(item.user.id, item.user);
  movieUnlocksByUser.set(item.user.id, new Set());
}

export const userStore = {
  createSession(token, user) {
    sessionsByToken.set(token, user);
  },

  getUserByToken(token) {
    return sessionsByToken.get(token) || null;
  },

  getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    return registeredUsersByEmail.get(cleanEmail) || null;
  },

  getUserById(id) {
    if (!id) return null;
    return registeredUsersById.get(id) || null;
  },

  registerUser({ email, password, full_name, role = 'viewer', tokens_balance = 2 }) {
    const cleanEmail = email.trim().toLowerCase();
    const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const user = {
      id,
      email: cleanEmail,
      full_name,
      role,
      username: cleanEmail.split('@')[0],
      tokens_balance: Number(tokens_balance),
      subscription_tier: 'free',
      subscription_status: 'inactive',
      profile_pic_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      created_at: new Date().toISOString()
    };

    const record = { password, user };
    registeredUsersByEmail.set(cleanEmail, record);
    registeredUsersById.set(id, user);
    if (!movieUnlocksByUser.has(id)) {
      movieUnlocksByUser.set(id, new Set());
    }

    return user;
  },

  updateUserTokens(userId, newBalance) {
    const user = registeredUsersById.get(userId);
    if (user) {
      user.tokens_balance = Number(newBalance);
      // Also update in record map
      const record = registeredUsersByEmail.get(user.email.toLowerCase());
      if (record) {
        record.user.tokens_balance = Number(newBalance);
      }
    }
    return user;
  },

  subscribeUser(userId, tier = 'monthly') {
    const user = registeredUsersById.get(userId);
    if (user) {
      user.subscription_tier = tier;
      user.subscription_status = 'active';
      // Grant VIP bonus tokens or unlimited pass
      user.tokens_balance = (user.tokens_balance || 0) + (tier === 'yearly' ? 50 : 20);
      const record = registeredUsersByEmail.get(user.email.toLowerCase());
      if (record) {
        record.user.subscription_tier = tier;
        record.user.subscription_status = 'active';
        record.user.tokens_balance = user.tokens_balance;
      }
    }
    return user;
  },

  isMovieUnlocked(userId, movieId) {
    const set = movieUnlocksByUser.get(userId);
    return !!set && set.has(movieId);
  },

  unlockMovie(userId, movieId) {
    if (!movieUnlocksByUser.has(userId)) {
      movieUnlocksByUser.set(userId, new Set());
    }
    movieUnlocksByUser.get(userId).add(movieId);
  },

  getUnlockedMovieIds(userId) {
    const set = movieUnlocksByUser.get(userId);
    return set ? Array.from(set) : [];
  }
};
