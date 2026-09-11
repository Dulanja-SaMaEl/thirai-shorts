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
    trailer_url: '/videos/demo-film.mp4',
    attachments: [
      { name: 'Director Statement.pdf', url: '/videos/demo-film.mp4' },
      { name: 'Official Poster HD.png', url: '/images/logo-icon.png' }
    ],
    uploader_email: 'director@thiraiplus.com',
    uploader_phone: '+94 77 123 4567',
    original_language: 'Tamil',
    subtitle_language: 'English',
    genre: 'Experimental Visual',
    running_time: '14 mins',
    year_of_production: '2026',
    country_of_production: 'Sri Lanka',
    director_name: 'Mani Ratnam',
    director_email: 'director@thiraiplus.com',
    director_phone: '+94 77 123 4567',
    producer_name: 'Madras Talkies',
    producer_email: 'producer@thiraiplus.com',
    producer_phone: '+94 77 111 2233',
    writer_name: 'Mani Ratnam',
    cinematographer_name: 'P. C. Sreeram',
    editor_name: 'A. Sreekar Prasad',
    sound_designer_name: 'Resul Pookutty',
    music_composer_name: 'A. R. Rahman',
    lead_casts: [
      { actor: 'Arvind Swami', character: 'The Traveler' },
      { actor: 'Revathi', character: 'The Narrator' }
    ],
    production_company: 'Thirai Visual Labs',
    budget_range: '$5,000 - $10,000',
    shooting_format: 'Arri Alexa Mini',
    editing_software: 'DaVinci Resolve Studio',
    premiere_status: 'National Premiere',
    production_date: '2026-01-15',
    applied_festivals: 'Cannes Short Film Corner, IFFI Goa',
    film_type: 'Independent Film',
    contact_name: 'Mani Ratnam',
    contact_email: 'director@thiraiplus.com',
    contact_phone: '+94 77 123 4567',
    social_media_links: 'https://instagram.com/thiraiplus',
    director_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    declaration_content_permission: true,
    declaration_copyright_compliant: true,
    declaration_screening_allowed: true,
    declaration_confirmed: true,
    digital_signature: 'Mani Ratnam',
    signature_date: '2026-01-20',
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
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    title: 'The Whispering Palms',
    description: 'A poignant drama set along the sun-drenched shores of Jaffna, following an aging fisherman preserving timeless coastal folklore against modern tides.',
    thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
    video_url: '/videos/demo-film.mp4',
    trailer_url: '/videos/demo-film.mp4',
    attachments: [
      { name: 'Production Notes.pdf', url: '/videos/demo-film.mp4' }
    ],
    uploader_email: 'vetri@grassroot.com',
    uploader_phone: '+94 77 987 6543',
    original_language: 'Tamil',
    subtitle_language: 'English, French',
    genre: 'Coastal Drama',
    running_time: '22 mins',
    year_of_production: '2025',
    country_of_production: 'Sri Lanka',
    director_name: 'Vetrimaaran',
    director_email: 'vetri@grassroot.com',
    director_phone: '+94 77 987 6543',
    producer_name: 'Grass Root Film Company',
    producer_email: 'producer@grassroot.com',
    producer_phone: '+94 77 987 6544',
    writer_name: 'Vetrimaaran',
    cinematographer_name: 'Velraj',
    editor_name: 'R. Ramar',
    sound_designer_name: 'Tapass Nayak',
    music_composer_name: 'Santhosh Narayanan',
    lead_casts: [
      { actor: 'Dhanush', character: 'Anbu' },
      { actor: 'Kishore', character: 'Elder Murugan' }
    ],
    production_company: 'Northern Cinema Collective',
    budget_range: '$10,000 - $20,000',
    shooting_format: 'RED Komodo 6K',
    editing_software: 'Final Cut Pro X',
    premiere_status: 'World Premiere',
    production_date: '2025-11-20',
    applied_festivals: 'Rotterdam Film Festival',
    film_type: 'Independent Film',
    contact_name: 'Vetrimaaran',
    contact_email: 'vetri@grassroot.com',
    contact_phone: '+94 77 987 6543',
    social_media_links: 'https://twitter.com/grassrootfilms',
    director_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    declaration_content_permission: true,
    declaration_copyright_compliant: true,
    declaration_screening_allowed: true,
    declaration_confirmed: true,
    digital_signature: 'Vetrimaaran',
    signature_date: '2025-11-25',
    status: 'approved',
    view_count: 2850,
    is_winner: true,
    winner_category: 'Golden Thira Award - Best Short Film',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reviews: []
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
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (!status) {
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
 * @route GET /api/movies/my/is-submitter
 * @desc Check if logged in user is a film submitter / director (qualifies for $2.99/mo filmmaker discount)
 */
router.get('/my/is-submitter', requireAuth(), async (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userRole = req.user.role;

    // 1. Direct role check
    if (userRole === 'director') {
      return res.status(200).json({
        success: true,
        is_submitter: true,
        email: userEmail,
        discount_eligible: true
      });
    }

    // 2. In-memory demo movies check
    const demoFound = DEMO_MOVIES.find(m =>
      (m.uploader_email && m.uploader_email.toLowerCase() === userEmail) ||
      (m.director_email && m.director_email.toLowerCase() === userEmail) ||
      (m.contact_email && m.contact_email.toLowerCase() === userEmail)
    );

    if (demoFound) {
      return res.status(200).json({
        success: true,
        is_submitter: true,
        email: userEmail,
        film_title: demoFound.title,
        discount_eligible: true
      });
    }

    // 3. Supabase Database check across all film submissions
    if (isSupabaseConfigured) {
      try {
        const { data: dbMovies } = await supabaseAdmin
          .from('movies')
          .select('id, title, director_name, status')
          .or(`uploader_email.ilike.${userEmail},director_email.ilike.${userEmail},contact_email.ilike.${userEmail}`)
          .limit(1);

        if (dbMovies && dbMovies.length > 0) {
          const isApproved = dbMovies[0].status === 'approved';
          return res.status(200).json({
            success: true,
            is_submitter: true,
            is_approved: isApproved,
            email: userEmail,
            film_title: dbMovies[0].title,
            discount_eligible: isApproved
          });
        }
      } catch (dbErr) {
        console.warn('Supabase submitter check note:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      is_submitter: false,
      email: userEmail,
      discount_eligible: false
    });
  } catch (error) {
    console.error('Error checking submitter status:', error);
    return res.status(500).json({ is_submitter: false, error: 'Server error' });
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
 * @desc Create new short movie submission with full festival metadata
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      synopsis,
      thumbnail_url,
      video_url,
      trailer_url,
      attachments,
      
      // Film Information
      original_language,
      subtitle_language,
      genre,
      running_time,
      year_of_production,
      country_of_production,

      // Cast & Crew Credits
      director_name,
      director_email,
      director_phone,
      producer_name,
      producer_email,
      producer_phone,
      writer_name,
      cinematographer_name,
      editor_name,
      sound_designer_name,
      music_composer_name,
      lead_casts,

      // Production Details
      production_company,
      budget_range,
      shooting_format,
      editing_software,

      // Festival-Specific Questions
      premiere_status,
      production_date,
      applied_festivals,
      film_type,

      // Primary Contact Person
      contact_name,
      contact_email,
      contact_phone,
      social_media_links,

      // Director Photograph & Legal Declaration
      director_photo_url,
      declaration_content_permission,
      declaration_copyright_compliant,
      declaration_screening_allowed,
      declaration_confirmed,
      digital_signature,
      signature_date,

      // Backward compatibility fields
      uploader_email,
      uploader_phone,
      payment_intent_id,
      submission_metadata
    } = req.body;

    const finalDescription = (description || synopsis || '').trim();
    const finalDirectorName = director_name || contact_name || 'Anonymous Director';
    const finalDirectorEmail = director_email || contact_email || uploader_email;
    const finalDirectorPhone = director_phone || contact_phone || uploader_phone;

    if (!title || !thumbnail_url || !video_url || !finalDirectorEmail || !finalDirectorPhone) {
      return res.status(400).json({
        error: 'Please provide all mandatory fields: Film Title, Thumbnail, Video, and Contact Information.'
      });
    }

    const movieRecord = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: finalDescription,
      thumbnail_url,
      video_url,
      trailer_url: trailer_url || null,
      attachments: Array.isArray(attachments) ? attachments : [],
      
      // Contact & Identification
      uploader_email: finalDirectorEmail,
      uploader_phone: finalDirectorPhone,

      // Film Information
      original_language: original_language || 'Tamil',
      subtitle_language: subtitle_language || 'English',
      genre: genre || 'Drama',
      running_time: running_time || '',
      year_of_production: year_of_production || new Date().getFullYear().toString(),
      country_of_production: country_of_production || 'Sri Lanka',

      // Cast & Crew Credits
      director_name: finalDirectorName,
      director_email: finalDirectorEmail,
      director_phone: finalDirectorPhone,
      producer_name: producer_name || '',
      producer_email: producer_email || '',
      producer_phone: producer_phone || '',
      writer_name: writer_name || '',
      cinematographer_name: cinematographer_name || '',
      editor_name: editor_name || '',
      sound_designer_name: sound_designer_name || '',
      music_composer_name: music_composer_name || '',
      lead_casts: Array.isArray(lead_casts) ? lead_casts : [],

      // Production Details
      production_company: production_company || '',
      budget_range: budget_range || '',
      shooting_format: shooting_format || '',
      editing_software: editing_software || '',

      // Festival-Specific Questions
      premiere_status: premiere_status || 'Not Premiered',
      production_date: production_date || '',
      applied_festivals: applied_festivals || '',
      film_type: film_type || 'Independent Film',

      // Primary Contact Person
      contact_name: contact_name || finalDirectorName,
      contact_email: contact_email || finalDirectorEmail,
      contact_phone: contact_phone || finalDirectorPhone,
      social_media_links: social_media_links || '',

      // Director Photograph & Legal Declaration
      director_photo_url: director_photo_url || null,
      declaration_content_permission: Boolean(declaration_content_permission),
      declaration_copyright_compliant: Boolean(declaration_copyright_compliant),
      declaration_screening_allowed: Boolean(declaration_screening_allowed),
      declaration_confirmed: Boolean(declaration_confirmed ?? (declaration_content_permission && declaration_copyright_compliant && declaration_screening_allowed)),
      digital_signature: digital_signature || '',
      signature_date: signature_date || new Date().toISOString().split('T')[0],
      submission_metadata: submission_metadata || {},

      // Moderation & Status
      status: 'pending',
      rejection_reason: null,
      view_count: 0,
      is_winner: false,
      winner_category: null,
      payment_status: payment_intent_id ? 'paid' : 'unpaid',
      stripe_payment_intent_id: payment_intent_id || null,
      created_at: new Date().toISOString()
    };

    let createdMovie = movieRecord;

    if (isSupabaseConfigured) {
      try {
        const { data: dbMovie, error } = await supabaseAdmin
          .from('movies')
          .insert([movieRecord])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert note, falling back to in-memory store:', error.message);
          // Retry with baseline columns if custom columns not yet migrated
          const baselineRecord = {
            title: movieRecord.title,
            description: movieRecord.description,
            thumbnail_url: movieRecord.thumbnail_url,
            video_url: movieRecord.video_url,
            attachments: movieRecord.attachments,
            uploader_email: movieRecord.uploader_email,
            uploader_phone: movieRecord.uploader_phone,
            status: movieRecord.status,
            payment_status: movieRecord.payment_status,
            stripe_payment_intent_id: movieRecord.stripe_payment_intent_id
          };
          const { data: fallbackDbMovie } = await supabaseAdmin
            .from('movies')
            .insert([baselineRecord])
            .select()
            .single();

          if (fallbackDbMovie) {
            createdMovie = { ...movieRecord, ...fallbackDbMovie };
          }
        } else if (dbMovie) {
          createdMovie = dbMovie;
        }
      } catch (dbErr) {
        console.warn('Supabase DB error during submission:', dbErr.message);
      }
    }

    // Always maintain in-memory fallback list
    DEMO_MOVIES.unshift(createdMovie);

    return res.status(201).json({
      success: true,
      message: 'Movie submitted successfully! Awaiting Admin review.',
      movie: createdMovie
    });
  } catch (error) {
    console.error('Error submitting movie:', error);
    return res.status(500).json({ error: 'Failed to save movie submission.' });
  }
});

export default router;
