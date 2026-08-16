import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

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

    // Filter by status if specified, otherwise return approved and pending (for gallery states)
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['approved', 'pending']);
    }

    if (category === 'winners') {
      query = query.eq('is_winner', true);
    }

    // Sort order
    if (sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('created_at', { ascending: false }); // Sort by newest, front-end can calculate rating avg
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: movies, error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true, movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return res.status(500).json({ error: 'Failed to retrieve movies gallery.' });
  }
});

/**
 * @route GET /api/movies/winners
 * @desc Get winner movies for Hero/Banner showcase
 */
router.get('/winners', async (req, res) => {
  try {
    const { data: winners, error } = await supabaseAdmin
      .from('movies')
      .select('*')
      .eq('is_winner', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, winners });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return res.status(500).json({ error: 'Failed to retrieve winner showcase.' });
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
