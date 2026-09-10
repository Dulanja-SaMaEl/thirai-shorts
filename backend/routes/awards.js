import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export const FESTIVAL_AWARD_CATEGORIES = [
  {
    id: 'main-film',
    name: 'Best Film of Entire Festival - Main Award',
    group: 'grand',
    description: 'The highest honor of Thirai+ Festival awarded to the most outstanding overall short film production.'
  },
  {
    id: 'audience-choice',
    name: 'Audience Choice Award',
    group: 'grand',
    description: 'Determined by total verified audience community ratings & public engagement.'
  },
  {
    id: 'social-impact',
    name: 'Best Social Impact Film',
    group: 'grand',
    description: 'Recognizing powerful films that highlight humanitarian, environmental, or urgent societal issues.'
  },
  {
    id: 'best-director',
    name: 'Best Director',
    group: 'directing_writing',
    description: 'Awarded to the filmmaker demonstrating exceptional vision, staging, and storytelling prowess.'
  },
  {
    id: 'best-screenplay',
    name: 'Best Screenplay',
    group: 'directing_writing',
    description: 'Honoring exceptional structure, pacing, and narrative economy in short-format storytelling.'
  },
  {
    id: 'script-writer',
    name: 'Best Script Writer',
    group: 'directing_writing',
    description: 'Celebrating compelling concept, character arcs, and narrative originality.'
  },
  {
    id: 'dialogue-writer',
    name: 'Best Dialogue Writer',
    group: 'directing_writing',
    description: 'Awarded for authentic, poignant, and memorable spoken word and verbal rhythm.'
  },
  {
    id: 'best-actor',
    name: 'Best Actor',
    group: 'performance',
    description: 'For an outstanding lead performance by a male actor in a short film.'
  },
  {
    id: 'best-actress',
    name: 'Best Actress',
    group: 'performance',
    description: 'For an outstanding lead performance by a female actor in a short film.'
  },
  {
    id: 'supporting-actor',
    name: 'Best Supporting Actor',
    group: 'performance',
    description: 'Recognizing crucial dramatic contribution and presence in a supporting role.'
  },
  {
    id: 'supporting-actress',
    name: 'Best Supporting Actress',
    group: 'performance',
    description: 'Recognizing nuanced dramatic resonance in a supporting role.'
  },
  {
    id: 'cinematography',
    name: 'Best Cinematography',
    group: 'craft',
    description: 'Celebrating mastery in lighting, composition, camera movement, and visual tone.'
  },
  {
    id: 'editing',
    name: 'Best Editing',
    group: 'craft',
    description: 'Honoring rhythm, tension, seamless montage, and narrative velocity.'
  },
  {
    id: 'sound-design',
    name: 'Best Sound Design',
    group: 'craft',
    description: 'Awarded for acoustic atmosphere, foley richness, and sonic immersion.'
  },
  {
    id: 'original-music',
    name: 'Best Original Music',
    group: 'craft',
    description: 'For the most emotionally evocative and original musical composition and score.'
  },
  {
    id: 'vfx-animation',
    name: 'Best VFX/Animation Used for Film (Differ from Animation Award Category)',
    group: 'craft',
    description: 'Recognizing standout visual effects, CGI integration, and composites within live-action films.'
  },
  {
    id: 'student-film',
    name: 'Best Student Film',
    group: 'formats',
    description: 'Honoring the most promising directorial debut and creative ambition by an active film student.'
  },
  {
    id: 'animation-film',
    name: 'Best Animation/3D/2D/Stop Motion Film',
    group: 'formats',
    description: 'Dedicated to excellence in animated storytelling across 2D, 3D CGI, and Stop-Motion art.'
  },
  {
    id: 'mobile-film',
    name: 'Best Mobile Film',
    group: 'formats',
    description: 'Celebrating cinematic brilliance shot entirely on smartphone / mobile cameras.'
  },
  {
    id: 'ai-film',
    name: 'Best Ai Film',
    group: 'formats',
    description: 'Pioneering work leveraging generative AI visuals, neural rendering, and innovative hybrid cinema.'
  },
  {
    id: 'comedy-short',
    name: 'Best Comedy Short Film',
    group: 'formats',
    description: 'Awarded for razor-sharp comedic timing, satire, and engaging entertainment value.'
  },
  {
    id: 'documentary-short',
    name: 'Best Documentary Short Film',
    group: 'formats',
    description: 'Honoring non-fiction journalistic courage, human truth, and documentary visual craft.'
  }
];

// Fallback in-memory store for demo & local preview
const DEMO_AWARDS_STORE = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    category: 'Best Film of Entire Festival - Main Award',
    movie_id: 'e0000000-0000-0000-0000-000000000002',
    recipient_name: 'Vetrimaaran (Director) & Grass Root Film Company',
    citation: 'Awarded for superlative poetic storytelling and unforgettable portrayal of coastal heritage.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000002',
      title: 'The Whispering Palms',
      thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Vetrimaaran',
      genre: 'Coastal Drama',
      running_time: '22 mins'
    }
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    category: 'Best Director',
    movie_id: 'e0000000-0000-0000-0000-000000000001',
    recipient_name: 'Mani Ratnam',
    citation: 'Awarded for masterful visual rhythm, aesthetic restraint, and atmospheric direction.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000001',
      title: 'Blue End Screen: Winter Outro',
      thumbnail_url: '/images/logo-wordmark.png',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Mani Ratnam',
      genre: 'Experimental Visual',
      running_time: '14 mins'
    }
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    category: 'Best Cinematography',
    movie_id: 'e0000000-0000-0000-0000-000000000002',
    recipient_name: 'Velraj',
    citation: 'Awarded for breathtaking ocean vistas and exquisite natural light photography.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000002',
      title: 'The Whispering Palms',
      thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Vetrimaaran',
      genre: 'Coastal Drama',
      running_time: '22 mins'
    }
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    category: 'Best Actor',
    movie_id: 'e0000000-0000-0000-0000-000000000002',
    recipient_name: 'Dhanush as Anbu',
    citation: 'Awarded for an emotionally nuanced, grounded, and mesmerizing lead performance.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000002',
      title: 'The Whispering Palms',
      thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Vetrimaaran',
      genre: 'Coastal Drama',
      running_time: '22 mins'
    }
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    category: 'Best Sound Design',
    movie_id: 'e0000000-0000-0000-0000-000000000001',
    recipient_name: 'Resul Pookutty',
    citation: 'Awarded for rich acoustic textures and pristine spatial audio design.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000001',
      title: 'Blue End Screen: Winter Outro',
      thumbnail_url: '/images/logo-wordmark.png',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Mani Ratnam',
      genre: 'Experimental Visual',
      running_time: '14 mins'
    }
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    category: 'Audience Choice Award',
    movie_id: 'e0000000-0000-0000-0000-000000000002',
    recipient_name: 'Prasanna Vithanage',
    citation: 'Crowned by popular audience votes across festival community screenings.',
    year: '2026',
    created_at: new Date().toISOString(),
    movie: {
      id: 'e0000000-0000-0000-0000-000000000002',
      title: 'The Whispering Palms',
      thumbnail_url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
      video_url: '/videos/demo-film.mp4',
      director_name: 'Vetrimaaran',
      genre: 'Coastal Drama',
      running_time: '22 mins'
    }
  }
];

/**
 * @route GET /api/awards
 * @desc Get all 22 official award categories merged with awarded movie & winner details
 */
router.get('/', async (req, res) => {
  try {
    let dbAwards = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from('festival_awards')
          .select(`
            id,
            category,
            movie_id,
            recipient_name,
            citation,
            year,
            created_at,
            movie:movie_id (
              id,
              title,
              thumbnail_url,
              video_url,
              director_name,
              director_photo_url,
              genre,
              running_time,
              view_count
            )
          `);

        if (!error && data) {
          dbAwards = data;
        }
      } catch (err) {
        console.warn('Supabase fetch awards notice:', err.message);
      }
    }

    const activeAwards = dbAwards.length > 0 ? dbAwards : DEMO_AWARDS_STORE;

    // Merge each category definition with any awarded record
    const fullCategoriesList = FESTIVAL_AWARD_CATEGORIES.map(cat => {
      const award = activeAwards.find(a => a.category.toLowerCase() === cat.name.toLowerCase());
      return {
        ...cat,
        is_awarded: Boolean(award),
        award_id: award ? award.id : null,
        movie_id: award ? award.movie_id : null,
        recipient_name: award ? award.recipient_name : null,
        citation: award ? award.citation : null,
        year: award ? (award.year || '2026') : '2026',
        awarded_at: award ? award.created_at : null,
        movie: award ? award.movie : null
      };
    });

    const totalAwarded = fullCategoriesList.filter(c => c.is_awarded).length;

    return res.status(200).json({
      success: true,
      total_categories: FESTIVAL_AWARD_CATEGORIES.length,
      total_awarded: totalAwarded,
      awards: fullCategoriesList,
      nominations: fullCategoriesList,
      unveil_date: '2027-01-01T00:00:00Z',
      is_unveiled: new Date() >= new Date('2027-01-01T00:00:00Z'),
      nominees_per_category: 3
    });

  } catch (error) {
    console.error('Error fetching festival awards:', error);
    return res.status(500).json({ error: 'Failed to retrieve festival awards.' });
  }
});

/**
 * @route POST /api/awards/assign
 * @desc Bestow / Grant an award to an approved movie (Admin Only)
 */
router.post('/assign', requireAuth(['admin']), async (req, res) => {
  try {
    const { category, movie_id, recipient_name, citation, year } = req.body;

    if (!category || !movie_id) {
      return res.status(400).json({ error: 'category and movie_id are required fields.' });
    }

    // Verify category exists in the official 22
    const validCategory = FESTIVAL_AWARD_CATEGORIES.find(
      c => c.name.toLowerCase() === category.trim().toLowerCase()
    );

    if (!validCategory) {
      return res.status(400).json({ error: `Invalid category. Must match one of the 22 official festival categories.` });
    }

    const normalizedCategory = validCategory.name;
    const finalYear = year || '2026';

    const awardRecord = {
      id: `award-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: normalizedCategory,
      movie_id,
      recipient_name: (recipient_name || '').trim(),
      citation: (citation || '').trim(),
      year: finalYear,
      created_at: new Date().toISOString()
    };

    let assignedAward = awardRecord;

    // 1. Supabase Persistence
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from('festival_awards')
          .upsert(
            {
              category: normalizedCategory,
              movie_id,
              recipient_name: awardRecord.recipient_name,
              citation: awardRecord.citation,
              year: finalYear,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'category' }
          )
          .select()
          .single();

        if (!error && data) {
          assignedAward = data;
        }

        // Also synchronize movies.is_winner
        await supabaseAdmin
          .from('movies')
          .update({
            is_winner: true,
            winner_category: normalizedCategory
          })
          .eq('id', movie_id);

      } catch (dbErr) {
        console.warn('Supabase assign award note:', dbErr.message);
      }
    }

    // 2. In-memory fallback sync
    const existingIdx = DEMO_AWARDS_STORE.findIndex(
      a => a.category.toLowerCase() === normalizedCategory.toLowerCase()
    );
    if (existingIdx >= 0) {
      DEMO_AWARDS_STORE[existingIdx] = { ...DEMO_AWARDS_STORE[existingIdx], ...assignedAward };
    } else {
      DEMO_AWARDS_STORE.push(assignedAward);
    }

    return res.status(200).json({
      success: true,
      message: `🏆 Award "${normalizedCategory}" successfully bestowed!`,
      award: assignedAward
    });

  } catch (error) {
    console.error('Error assigning award:', error);
    return res.status(500).json({ error: 'Failed to assign festival award.' });
  }
});

/**
 * @route DELETE /api/awards/category/:category
 * @desc Revoke / unassign an award from a category (Admin Only)
 */
router.delete('/category/:category', requireAuth(['admin']), async (req, res) => {
  try {
    const { category } = req.params;

    if (isSupabaseConfigured) {
      try {
        await supabaseAdmin
          .from('festival_awards')
          .delete()
          .ilike('category', category);
      } catch (dbErr) {
        console.warn('Supabase delete award note:', dbErr.message);
      }
    }

    const idx = DEMO_AWARDS_STORE.findIndex(
      a => a.category.toLowerCase() === decodeURIComponent(category).toLowerCase()
    );
    if (idx >= 0) {
      DEMO_AWARDS_STORE.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: `Award for "${category}" has been revoked.`
    });

  } catch (error) {
    console.error('Error revoking award:', error);
    return res.status(500).json({ error: 'Failed to revoke festival award.' });
  }
});

export default router;
