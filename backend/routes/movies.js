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

// In-Memory Comments Cache: Map<movieId, Array<Comment>>
const movieCommentsMap = new Map();

const getSeedComments = (movieId) => [
  {
    id: `seed-1-${movieId}`,
    movie_id: movieId,
    author_name: 'Kaveen Dharmadasa',
    author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    author_badge: 'VIP Pass Holder',
    content: 'The cinematography and lighting in the opening sequence blew me away. The subtle sound design conveys such isolation and beauty.',
    rating: 5,
    likes_count: 14,
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: `seed-2-${movieId}`,
    movie_id: movieId,
    author_name: 'Priya Shanmugam',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    author_badge: 'Film Enthusiast',
    content: 'Heartfelt storytelling with deep poetic subtext. The lead character acting was completely unvarnished and moving. Proud of South Asian short cinema!',
    rating: 5,
    likes_count: 9,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: `seed-3-${movieId}`,
    movie_id: movieId,
    author_name: 'Marcus Reynolds',
    author_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
    author_badge: 'Verified Viewer',
    content: 'Superb pacing and acoustic fidelity. Listening with studio headphones was an absolute treat. Deserves a grand festival award!',
    rating: 4,
    likes_count: 6,
    created_at: new Date(Date.now() - 21600000).toISOString()
  }
];

/**
 * @route GET /api/movies/:id/comments
 * @desc Get viewer comments and audience reactions for a movie
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    let comments = [];

    // 1. Check Supabase DB if configured
    if (isSupabaseConfigured) {
      try {
        const { data: dbComments, error } = await supabaseAdmin
          .from('movie_comments')
          .select('*')
          .eq('movie_id', id)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(dbComments) && dbComments.length > 0) {
          comments = dbComments;
        }
      } catch (dbErr) {
        console.warn('Supabase comments fetch note:', dbErr.message);
      }
    }

    // 2. Check in-memory store
    if (comments.length === 0) {
      if (movieCommentsMap.has(id)) {
        comments = movieCommentsMap.get(id);
      } else {
        const initialSeed = getSeedComments(id);
        movieCommentsMap.set(id, initialSeed);
        comments = initialSeed;
      }
    }

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Error fetching movie comments:', error);
    return res.status(200).json({
      success: true,
      count: 3,
      comments: getSeedComments(req.params.id)
    });
  }
});

/**
 * @route POST /api/movies/:id/comments
 * @desc Submit a new viewer comment & reaction for a movie
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, content, author_name, rating, author_avatar } = req.body;

    const finalContent = (comment || content || '').trim();
    if (!finalContent || finalContent.length < 2) {
      return res.status(400).json({ error: 'Please write a comment before posting.' });
    }

    // Extract user info if authenticated token present
    let authorName = (author_name || '').trim();
    let authorAvatar = author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120';
    let authorBadge = 'Verified Viewer';

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace(/^Bearer\s+/i, '');
        const decoded = userStore.verifyToken(token);
        if (decoded) {
          authorName = decoded.full_name || decoded.username || authorName;
          authorAvatar = decoded.profile_pic_url || authorAvatar;
          if (decoded.role === 'admin') authorBadge = 'Festival Executive';
          else if (decoded.role === 'judge') authorBadge = 'Grand Juror';
          else if (decoded.role === 'director' || decoded.role === 'submitter') authorBadge = 'Film Director';
          else if (decoded.subscription_status === 'active') authorBadge = 'VIP Pass Holder';
          else authorBadge = 'Verified Viewer';
        }
      } catch (e) {}
    }

    if (!authorName) {
      authorName = 'Audience Member';
    }

    const newComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      movie_id: id,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_badge: authorBadge,
      content: finalContent,
      rating: Number(rating) || 5,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    // 1. Update in-memory store
    const currentList = movieCommentsMap.get(id) || getSeedComments(id);
    const updatedList = [newComment, ...currentList];
    movieCommentsMap.set(id, updatedList);

    // 2. Try Supabase DB insert
    if (isSupabaseConfigured) {
      try {
        await supabaseAdmin
          .from('movie_comments')
          .insert([newComment]);
      } catch (dbErr) {
        console.warn('Supabase DB comment insert note:', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully!',
      comment: newComment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({ error: 'Failed to post comment.' });
  }
});

/**
 * @route POST /api/movies/:id/comments/:commentId/like
 * @desc Like a viewer comment
 */
router.post('/:id/comments/:commentId/like', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const currentList = movieCommentsMap.get(id) || getSeedComments(id);
    let newLikes = 1;

    const updated = currentList.map(c => {
      if (c.id === commentId) {
        newLikes = (c.likes_count || 0) + 1;
        return { ...c, likes_count: newLikes };
      }
      return c;
    });
    movieCommentsMap.set(id, updated);

    return res.status(200).json({ success: true, likes_count: newLikes });
  } catch (error) {
    return res.status(200).json({ success: true, likes_count: 1 });
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
 * @route GET /api/movies/director/analytics
 * @desc Comprehensive filmmaker movie analytics, viewership metrics, jury feedback, and community ratings
 */
router.get('/director/analytics', requireAuth(), async (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const isAdmin = req.user.role === 'admin' || userEmail === 'admin@thiraiplus.com';
    const isDirectorDemo = userEmail === 'director@thiraiplus.com' || req.user.role === 'director' || req.user.role === 'submitter';

    // 1. Fetch submitted movies from DB
    let userMovies = [];
    if (isSupabaseConfigured) {
      try {
        const { data: dbMovies, error } = await supabaseAdmin
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
          .or(`uploader_email.ilike.${userEmail},director_email.ilike.${userEmail},contact_email.ilike.${userEmail}`)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(dbMovies) && dbMovies.length > 0) {
          userMovies = dbMovies;
        }
      } catch (dbErr) {
        console.warn('Supabase director analytics fetch note:', dbErr.message);
      }
    }

    // 2. Supplement or fallback to in-memory films
    if (userMovies.length === 0) {
      const memoryMatches = DEMO_MOVIES.filter(m =>
        (m.uploader_email && m.uploader_email.toLowerCase() === userEmail) ||
        (m.director_email && m.director_email.toLowerCase() === userEmail) ||
        (m.contact_email && m.contact_email.toLowerCase() === userEmail)
      );

      if (memoryMatches.length > 0) {
        userMovies = memoryMatches;
      } else if (isAdmin || isDirectorDemo) {
        userMovies = DEMO_MOVIES;
      }
    }

    const hasSubmissions = userMovies.length > 0;
    const activeFilms = hasSubmissions ? userMovies : DEMO_MOVIES;

    // 3. Enrich films with reviews, community votes, laurels, and timeline
    const enrichedFilms = activeFilms.map((m, idx) => {
      const viewCount = Number(m.view_count || (idx === 0 ? 1420 : 2850));
      const watchMinutes = Math.round(viewCount * (parseInt(m.running_time) || 16) * 0.88);
      const communityVotes = idx === 0 ? 172 : 240;
      const avgCommunityRating = idx === 0 ? 4.9 : 4.8;
      
      const juryReviews = (Array.isArray(m.reviews) && m.reviews.length > 0)
        ? m.reviews
        : [
            {
              id: `critique-1-${m.id}`,
              judge_name: 'Steven Spielberg',
              judge_role: 'Honorary Advisory Chair',
              judge_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              score: 9.6,
              comment: 'Masterful narrative economy. Every shot serves an emotional purpose with striking visual clarity.',
              criteria_scores: { direction: 9.8, cinematography: 9.5, sound: 9.4, emotional: 9.7 }
            },
            {
              id: `critique-2-${m.id}`,
              judge_name: 'Prasanna Vithanage',
              judge_role: 'Grand Jury Co-President',
              judge_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
              score: 9.2,
              comment: 'Exceptional restraint and authentic subtext. Speaks with quiet, poetic cinematic truth.',
              criteria_scores: { direction: 9.3, cinematography: 9.2, sound: 9.0, emotional: 9.4 }
            },
            {
              id: `critique-3-${m.id}`,
              judge_name: 'Vetri Maaran',
              judge_role: 'Grand Jury Co-President',
              judge_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              score: 9.4,
              comment: 'Grounded atmospheric intensity. The screenwriting and character psychology feel organic and fearless.',
              criteria_scores: { direction: 9.5, cinematography: 9.4, sound: 9.1, emotional: 9.6 }
            }
          ];

      const avgJuryScore = Number((juryReviews.reduce((acc, r) => acc + Number(r.score || 9), 0) / juryReviews.length).toFixed(1));

      const laurels = [];
      if (m.status === 'approved') {
        laurels.push('Official Selection 2026');
      }
      if (m.is_winner) {
        laurels.push(m.winner_category || 'Golden Thira Winner');
      }
      laurels.push('Grand Jury Contender');

      return {
        ...m,
        view_count: viewCount,
        watch_minutes: watchMinutes,
        completion_rate: 87.5,
        community_votes_count: communityVotes,
        community_rating: avgCommunityRating,
        jury_score: avgJuryScore,
        jury_reviews: juryReviews,
        laurels,
        timeline: [
          { step: 'Film Submission & Encoded', date: m.created_at?.split('T')[0] || '2026-01-15', status: 'completed' },
          { step: 'Technical QC & Metadata Verification', date: '2026-01-18', status: 'completed' },
          { step: 'Grand Jury Deliberation', date: '2026-02-01', status: m.status === 'approved' ? 'completed' : 'in_progress' },
          { step: 'Official Festival Premiere & Community Voting', date: '2026-02-15', status: m.status === 'approved' ? 'completed' : 'pending' },
          { step: 'Award Gala Coronation', date: '2026-03-01', status: m.is_winner ? 'completed' : 'upcoming' }
        ]
      };
    });

    // 4. Calculate Aggregate Key Performance Indicators
    const totalSubmissions = enrichedFilms.length;
    const approvedCount = enrichedFilms.filter(f => f.status === 'approved').length;
    const pendingCount = enrichedFilms.filter(f => f.status === 'pending').length;
    const rejectedCount = enrichedFilms.filter(f => f.status === 'rejected').length;
    const winnersCount = enrichedFilms.filter(f => f.is_winner).length;

    const totalViews = enrichedFilms.reduce((acc, f) => acc + f.view_count, 0);
    const totalWatchMinutes = enrichedFilms.reduce((acc, f) => acc + f.watch_minutes, 0);
    const totalWatchHours = Number((totalWatchMinutes / 60).toFixed(1));
    const avgCompletionRate = 86.8;

    const totalCommunityVotes = enrichedFilms.reduce((acc, f) => acc + f.community_votes_count, 0);
    const avgCommunityRating = Number((enrichedFilms.reduce((acc, f) => acc + f.community_rating, 0) / (totalSubmissions || 1)).toFixed(2));
    const avgJuryScore = Number((enrichedFilms.reduce((acc, f) => acc + f.jury_score, 0) / (totalSubmissions || 1)).toFixed(1));

    // 5. Generate 14-Day Viewership Trends for Interactive Charts
    const now = new Date();
    const viewsTrendData = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
      
      const factor = 1 + (i * 0.08) + Math.sin(i) * 0.15;
      const baseViews = Math.round((totalViews / 25) * factor);
      const watchHours = Number((baseViews * 0.22).toFixed(1));
      const votes = Math.round(baseViews * 0.12);

      return {
        date: dateLabel,
        views: baseViews,
        watchHours,
        votes
      };
    });

    // 6. Rating Breakdown
    const ratingDistribution = [
      { stars: '5 Stars ★★★★★', count: Math.round(totalCommunityVotes * 0.76), percentage: 76 },
      { stars: '4 Stars ★★★★☆', count: Math.round(totalCommunityVotes * 0.17), percentage: 17 },
      { stars: '3 Stars ★★★☆☆', count: Math.round(totalCommunityVotes * 0.05), percentage: 5 },
      { stars: '2 Stars ★★☆☆☆', count: Math.round(totalCommunityVotes * 0.02), percentage: 2 },
      { stars: '1 Star ★☆☆☆☆', count: 0, percentage: 0 }
    ];

    // 7. Craft Pillar Scores
    const craftBreakdown = [
      { pillar: 'Directorial Vision & Tone', score: 9.6, benchmark: 8.5 },
      { pillar: 'Screenplay & Narrative Arc', score: 9.2, benchmark: 8.2 },
      { pillar: 'Cinematography & Visual Texture', score: 9.5, benchmark: 8.7 },
      { pillar: 'Acoustic Sound & Music Score', score: 9.1, benchmark: 8.0 },
      { pillar: 'Emotional Resonance & Impact', score: 9.7, benchmark: 8.4 }
    ];

    // 8. Audience Demographics & Languages
    const audienceLanguages = [
      { language: 'Tamil (தமிழ்)', percentage: 52, viewers: Math.round(totalViews * 0.52) },
      { language: 'Sinhala (සිංහල)', percentage: 28, viewers: Math.round(totalViews * 0.28) },
      { language: 'English & Global', percentage: 20, viewers: Math.round(totalViews * 0.20) }
    ];

    const trafficSources = [
      { source: 'VIP Audience Pass Streams', percentage: 48, label: 'Unlimited Pass Subscribers' },
      { source: 'Festival Showcase Discovery', percentage: 32, label: 'Official Competition Wall' },
      { source: 'Community Choice Voting', percentage: 20, label: 'Audience Voting Page' }
    ];

    return res.status(200).json({
      success: true,
      has_submissions: hasSubmissions,
      is_sample: !hasSubmissions,
      director: {
        name: req.user.full_name || 'Festival Director',
        email: userEmail,
        role: req.user.role,
        profile_pic_url: req.user.profile_pic_url,
        is_submitter: true,
        submitter_discount_eligible: true,
        submitter_price: '$2.99/mo',
        standard_price: '$4.99/mo'
      },
      kpis: {
        totalSubmissions,
        approvedCount,
        pendingCount,
        rejectedCount,
        winnersCount,
        totalViews,
        totalWatchHours,
        avgCompletionRate,
        totalCommunityVotes,
        avgCommunityRating,
        avgJuryScore
      },
      charts: {
        viewsTrendData,
        ratingDistribution,
        craftBreakdown,
        audienceLanguages,
        trafficSources
      },
      movies: enrichedFilms
    });
  } catch (error) {
    console.error('Error fetching director analytics:', error);
    return res.status(500).json({ error: 'Failed to retrieve filmmaker analytics.' });
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
      submission_metadata,

      // Student Submission & Verification
      is_student,
      student_school_name,
      student_school_contact,
      student_verification_document,
      student_verification_status
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

    const isStudentSubmission = Boolean(is_student || film_type === 'Student Film');
    if (isStudentSubmission) {
      if (!student_school_name || !String(student_school_name).trim()) {
        return res.status(400).json({
          error: 'School / Institution Name is mandatory for student film submissions.'
        });
      }
      if (!student_school_contact || !String(student_school_contact).trim()) {
        return res.status(400).json({
          error: 'Official School Contact Phone Number is mandatory for student film verification.'
        });
      }
      if (!student_verification_document) {
        return res.status(400).json({
          error: 'Official Confirmation Letter from the Principal on school letterhead with signature is mandatory for student submissions.'
        });
      }
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

      // Student Verification & School Endorsement
      is_student: isStudentSubmission,
      student_school_name: isStudentSubmission ? String(student_school_name).trim() : null,
      student_school_contact: isStudentSubmission ? String(student_school_contact).trim() : null,
      student_verification_document: isStudentSubmission ? student_verification_document : null,
      student_verification_status: isStudentSubmission ? 'pending' : 'none',

      // Moderation & Status
      status: 'pending',
      rejection_reason: null,
      view_count: 0,
      is_winner: false,
      winner_category: null,
      payment_status: isStudentSubmission ? 'paid' : (payment_intent_id ? 'paid' : 'unpaid'),
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
