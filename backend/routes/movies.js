import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const DEMO_MOVIES = [
  {
    id: 'demo-winter-film-001',
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
 * @route GET /api/movies/:id
 * @desc Get movie by ID and increment view count
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count via Supabase RPC or direct query
    await supabaseAdmin.rpc('increment_movie_view', { p_movie_id: id });

    // Fetch movie with public judge reviews
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
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.status(200).json({ success: true, movie });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return res.status(500).json({ error: 'Failed to retrieve movie details.' });
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
