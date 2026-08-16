import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Enforce Judge role
router.use(requireAuth(['judge', 'admin']));

/**
 * @route GET /api/judge/assigned-movies
 * @desc Get list of movies assigned for judging/review
 */
router.get('/assigned-movies', async (req, res) => {
  try {
    const judgeId = req.user.id;

    // Fetch approved movies and include any existing review by this judge
    const { data: movies, error } = await supabaseAdmin
      .from('movies')
      .select(`
        *,
        reviews (
          id,
          score,
          comment,
          judge_id,
          created_at
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Attach existing judge review if available
    const processedMovies = movies.map(movie => {
      const existingReview = movie.reviews?.find(r => r.judge_id === judgeId) || null;
      return {
        ...movie,
        my_review: existingReview
      };
    });

    return res.status(200).json({ success: true, movies: processedMovies });
  } catch (error) {
    console.error('Error fetching assigned movies for judge:', error);
    return res.status(500).json({ error: 'Failed to retrieve movies for judging.' });
  }
});

/**
 * @route POST /api/judge/reviews
 * @desc Submit or update 1-10 rating score & public text review for a short film
 */
router.post('/reviews', async (req, res) => {
  try {
    const judgeId = req.user.id;
    const { movie_id, score, comment } = req.body;

    if (!movie_id || !score || !comment) {
      return res.status(400).json({ error: 'movie_id, score, and comment are required.' });
    }

    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 10) {
      return res.status(400).json({ error: 'Rating score must be a number between 1 and 10.' });
    }

    // Upsert review (Insert or Update if existing)
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .upsert({
        movie_id,
        judge_id: judgeId,
        score: numericScore,
        comment: comment.trim(),
        is_public: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'movie_id,judge_id' })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Review saved successfully and will be published on the movie showcase page.',
      review
    });

  } catch (error) {
    console.error('Error submitting judge review:', error);
    return res.status(500).json({ error: 'Failed to save judge review.' });
  }
});

export default router;
