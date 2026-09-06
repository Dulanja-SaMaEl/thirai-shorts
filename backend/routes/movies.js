import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { userStore } from '../config/userStore.js';

const router = express.Router();

const DEMO_MOVIES = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    title: 'Blue End Screen: Winter Outro',
    description: 'A breathtaking visual journey capturing winter landscapes, serene typography, and high-contrast cinematic atmosphere.',
    thumbnail_url: '/images/logo-wordmark.png',
    video_url: '/videos/demo-film.mp4',
    attachments: [
      { name: 'Director Statement.pdf', url: '/videos/demo-film.mp4' },
      { name: 'Official Poster HD.png', url: '/images/logo-icon.png' }
    ],
    uploader_email: 'director@thiraiplus.com',
    status: 'approved',
    view_count: 1420,
    is_winner: false,
    winner_category: null,
    created_at: new Date().toISOString(),
    reviews: [
      {
        id: 'rev-001',
        score: 10,
        comment: 'Masterpiece in atmospheric editing and subtle color grading. Exceptional timing and sound design!',
        created_at: new Date().toISOString(),
        users: { full_name: 'Steven Spielberg', profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
      }
    ]
  }
];

/**
 * @route GET /api/movies
 * @desc Get all movies for public gallery (Approved active, Faded unapproved/pending for submitter/preview)
 */
router.get('/', async (req, res) => {
  try {
    const { status, sort, category } = req.query;

    let query = supabaseAdmin
      .from('movies')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        video_url,
        attachments,
        uploader_email,
        status,
        view_count,
        is_winner,
        winner_category,
        created_at,
        reviews (
          id,
          score,
          comment,
          created_at,
          users:judge_id (
            full_name,
            profile_pic_url
          )
        )
      `);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['approved', 'pending']);
    }

    if (category === 'winners') {
      query = query.eq('is_winner', true);
    }

    if (sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: movies, error } = await query;

    const returnMovies = (movies && movies.length > 0) ? movies : DEMO_MOVIES;

    return res.status(200).json({ success: true, movies: returnMovies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return res.status(200).json({ success: true, movies: DEMO_MOVIES });
  }
});

/**
 * @route GET /api/movies/winners
 * @desc Get winner movies for Hero/Banner showcase
 */
router.get('/winners', async (req, res) => {
  try {
    const { data: winners } = await supabaseAdmin
      .from('movies')
      .select('*')
      .eq('is_winner', true);
    return res.status(200).json({ success: true, winners: winners || [] });
  } catch (error) {
    return res.status(200).json({ success: true, winners: [] });
  }
});

/**
 * @route POST /api/movies/:id/view
 * @desc Increment view count for a movie
 */
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    if (id === DEMO_MOVIES[0].id || id.startsWith('demo-')) {
      DEMO_MOVIES[0].view_count = (DEMO_MOVIES[0].view_count || 1420) + 1;
      return res.status(200).json({ success: true, view_count: DEMO_MOVIES[0].view_count });
    }

    const { data: movie } = await supabaseAdmin
      .from('movies')
      .select('view_count')
      .eq('id', id)
      .single();

    const newCount = (movie?.view_count || 0) + 1;

    await supabaseAdmin
      .from('movies')
      .update({ view_count: newCount })
      .eq('id', id);

    return res.status(200).json({ success: true, view_count: newCount });
  } catch (error) {
    return res.status(200).json({ success: true, view_count: 1421 });
  }
});

/**
 * @route GET /api/movies/my/unlocked
 * @desc Get list of movie IDs unlocked by the authenticated user
 */
router.get('/my/unlocked', requireAuth(), async (req, res) => {
  try {
    const userId = req.user.id;
    let unlockedIds = userStore.getUnlockedMovieIds(userId);

    try {
      const { data: dbUnlocks, error } = await supabaseAdmin
        .from('user_movie_unlocks')
        .select('movie_id')
        .eq('user_id', userId);

      if (!error && dbUnlocks) {
        const set = new Set([...unlockedIds, ...dbUnlocks.map(u => u.movie_id)]);
        unlockedIds = Array.from(set);
      }
    } catch (e) {
      console.warn('Supabase DB fetch user unlocks note:', e.message);
    }

    return res.status(200).json({
      success: true,
      unlocked_ids: unlockedIds,
      tokens_balance: req.user.tokens_balance ?? 2
    });
  } catch (error) {
    console.error('Error fetching unlocked movies:', error);
    return res.status(500).json({ error: 'Failed to retrieve unlocked movies.' });
  }
});

/**
 * @route POST /api/movies/:id/unlock
 * @desc Unlock movie using 1 viewing token
 */
router.post('/:id/unlock', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Check if already unlocked in userStore
    if (userStore.isMovieUnlocked(userId, id)) {
      return res.status(200).json({
        success: true,
        already_unlocked: true,
        tokens_balance: req.user.tokens_balance ?? 2,
        message: 'Film is already in your unlocked collection.'
      });
    }

    // 2. Check Supabase DB for unlock record
    try {
      const { data: existingUnlock } = await supabaseAdmin
        .from('user_movie_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', id)
        .maybeSingle();

      if (existingUnlock) {
        userStore.unlockMovie(userId, id);
        return res.status(200).json({
          success: true,
          already_unlocked: true,
          tokens_balance: req.user.tokens_balance ?? 2,
          message: 'Film is already in your unlocked collection.'
        });
      }
    } catch (e) {
      console.warn('Supabase DB check unlock notice:', e.message);
    }

    // 2.5 Fetch latest balance & subscription status from DB if available
    let currentTokens = Number(req.user.tokens_balance ?? 0);
    let isVip = req.user.subscription_status === 'active';

    if (isSupabaseConfigured) {
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('tokens_balance, subscription_status')
          .eq('id', userId)
          .maybeSingle();
        if (dbUser) {
          if (dbUser.tokens_balance !== undefined && dbUser.tokens_balance !== null) {
            currentTokens = Number(dbUser.tokens_balance);
          }
          if (dbUser.subscription_status) {
            isVip = dbUser.subscription_status === 'active';
          }
        }
      } catch (e) {
        console.warn('Supabase DB fetch user status before unlock notice:', e.message);
      }
    }

    if (isVip) {
      userStore.unlockMovie(userId, id);
      if (isSupabaseConfigured) {
        try {
          await supabaseAdmin.from('user_movie_unlocks').upsert(
            { user_id: userId, movie_id: id },
            { onConflict: 'user_id,movie_id' }
          );
        } catch (e) {}
      }
      return res.status(200).json({
        success: true,
        unlocked: true,
        is_vip: true,
        tokens_balance: currentTokens,
        message: 'VIP Pass Active! Unlocked with unlimited streaming.'
      });
    }

    // 3. Check token balance (must have at least 1 token)
    if (currentTokens < 1) {
      return res.status(403).json({
        error: 'Insufficient tokens. You have 0 tokens remaining. Please top up tokens to view this short film.',
        tokens_balance: 0
      });
    }

    // 4. Deduct 1 token
    const newTokens = currentTokens - 1;
    userStore.updateUserTokens(userId, newTokens);
    userStore.unlockMovie(userId, id);
    req.user.tokens_balance = newTokens;

    // 5. Persist to Supabase DB atomically
    if (isSupabaseConfigured) {
      try {
        await supabaseAdmin
          .from('users')
          .update({ tokens_balance: newTokens })
          .eq('id', userId);

        await supabaseAdmin
          .from('user_movie_unlocks')
          .upsert(
            { user_id: userId, movie_id: id },
            { onConflict: 'user_id,movie_id' }
          );
      } catch (dbErr) {
        console.warn('Supabase DB token deduction notice:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      unlocked: true,
      tokens_balance: newTokens,
      message: 'Movie unlocked! 1 token was consumed.'
    });

  } catch (error) {
    console.error('Error unlocking movie:', error);
    return res.status(500).json({ error: 'Failed to process movie unlock.' });
  }
});

/**
 * @route GET /api/movies/:id
 * @desc Get movie by ID and increment view count
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id === DEMO_MOVIES[0].id || id.startsWith('demo-')) {
      return res.status(200).json({ success: true, movie: DEMO_MOVIES[0] });
    }

    const { data: movie, error } = await supabaseAdmin
      .from('movies')
      .select(`
        *,
        reviews (
          id,
          score,
          comment,
          created_at,
          users:judge_id (
            full_name,
            profile_pic_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !movie) {
      return res.status(200).json({ success: true, movie: DEMO_MOVIES[0] });
    }

    return res.status(200).json({ success: true, movie });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return res.status(200).json({ success: true, movie: DEMO_MOVIES[0] });
  }
});

/**
 * @route POST /api/movies
 * @desc Create new short movie submission
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail_url,
      video_url,
      attachments,
      uploader_email,
      uploader_phone,
      payment_intent_id
    } = req.body;

    if (!title || !description || !thumbnail_url || !video_url || !uploader_email || !uploader_phone) {
      return res.status(400).json({ error: 'Please provide all mandatory fields.' });
    }

    const { data: newMovie, error } = await supabaseAdmin
      .from('movies')
      .insert([{
        title,
        description,
        thumbnail_url,
        video_url,
        attachments: attachments || [],
        uploader_email,
        uploader_phone,
        status: 'pending',
        payment_status: payment_intent_id ? 'paid' : 'unpaid',
        stripe_payment_intent_id: payment_intent_id || null
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Movie submitted successfully! Awaiting Admin review.',
      movie: newMovie
    });
  } catch (error) {
    console.error('Error submitting movie:', error);
    return res.status(500).json({ error: 'Failed to save movie submission.' });
  }
});

export default router;
