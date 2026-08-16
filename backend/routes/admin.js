import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes with Admin role check
router.use(requireAuth(['admin']));

/**
 * @route GET /api/admin/dashboard
 * @desc Get Analytics Dashboard metrics (views, reviews, income, status breakdown)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Total movies count by status
    const { data: movies, error: movieErr } = await supabaseAdmin
      .from('movies')
      .select('id, status, view_count, created_at, payment_status');

    if (movieErr) throw movieErr;

    // Total Judge Reviews
    const { count: reviewCount, error: reviewErr } = await supabaseAdmin
      .from('reviews')
      .select('id', { count: 'exact', head: true });

    if (reviewErr) throw reviewErr;

    // Payments summary
    const { data: payments, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('amount_cents, created_at, status')
      .eq('status', 'succeeded');

    if (payErr) throw payErr;

    // Calculate aggregated metrics
    const totalViews = movies.reduce((sum, m) => sum + Number(m.view_count || 0), 0);
    const approvedCount = movies.filter(m => m.status === 'approved').length;
    const pendingCount = movies.filter(m => m.status === 'pending').length;
    const rejectedCount = movies.filter(m => m.status === 'rejected').length;

    const totalRevenueCents = payments ? payments.reduce((sum, p) => sum + p.amount_cents, 0) : 0;
    const totalRevenueUSD = (totalRevenueCents / 100).toFixed(2);

    // Monthly revenue financial breakdown for chart rendering
    const monthlyRevenue = {};
    (payments || []).forEach(p => {
      const monthKey = new Date(p.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (p.amount_cents / 100);
    });

    const revenueChartData = Object.entries(monthlyRevenue).map(([month, total]) => ({
      month,
      revenue: parseFloat(total.toFixed(2))
    }));

    return res.status(200).json({
      success: true,
      analytics: {
        totalMovies: movies.length,
        approvedCount,
        pendingCount,
        rejectedCount,
        totalViews,
        totalReviews: reviewCount || 0,
        totalRevenueUSD,
        revenueChartData
      }
    });

  } catch (error) {
    console.error('Error loading admin dashboard analytics:', error);
    return res.status(500).json({ error: 'Failed to retrieve analytics metrics.' });
  }
});

/**
 * @route PUT /api/admin/movies/:id/moderate
 * @desc Moderate movie: Approve or Reject
 */
router.put('/movies/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, is_winner, winner_category } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updatePayload = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'rejected') {
      updatePayload.rejection_reason = rejection_reason || 'Does not meet festival guidelines.';
    } else if (status === 'approved') {
      updatePayload.rejection_reason = null;
    }

    if (typeof is_winner === 'boolean') {
      updatePayload.is_winner = is_winner;
      updatePayload.winner_category = winner_category || null;
    }

    const { data: updatedMovie, error } = await supabaseAdmin
      .from('movies')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Movie status updated to ${status}.`,
      movie: updatedMovie
    });

  } catch (error) {
    console.error('Error moderating movie:', error);
    return res.status(500).json({ error: 'Failed to update movie moderation status.' });
  }
});

/**
 * @route POST /api/admin/judges
 * @desc Register new Judge account
 */
router.post('/judges', async (req, res) => {
  try {
    const { full_name, email, username, password, profile_pic_url } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ error: 'Full Name, Email, Username, and Password are required.' });
    }

    // Register user in Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'judge' }
    });

    if (authErr) {
      return res.status(400).json({ error: authErr.message });
    }

    // Store Judge record in custom users table
    const { data: judgeRecord, error: dbErr } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        full_name,
        username,
        role: 'judge',
        profile_pic_url: profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      }])
      .select()
      .single();

    if (dbErr) throw dbErr;

    return res.status(201).json({
      success: true,
      message: 'Judge registered successfully.',
      judge: judgeRecord
    });

  } catch (error) {
    console.error('Error registering judge:', error);
    return res.status(500).json({ error: 'Failed to register judge user.' });
  }
});

/**
 * @route POST /api/admin/community-rating-timer
 * @desc Enable/Disable Community Rating Event and set End Time Duration
 */
router.post('/community-rating-timer', async (req, res) => {
  try {
    const { is_active, duration_hours, custom_end_time } = req.body;

    let endTime = null;
    if (is_active) {
      if (custom_end_time) {
        endTime = custom_end_time;
      } else if (duration_hours) {
        const d = new Date();
        d.setHours(d.getHours() + parseInt(duration_hours, 10));
        endTime = d.toISOString();
      }
    }

    const settingValue = {
      is_active: !!is_active,
      end_time: endTime,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        key: 'community_rating_event',
        value: settingValue,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Community rating event ${is_active ? 'activated' : 'deactivated'}.`,
      setting: settingValue
    });

  } catch (error) {
    console.error('Error updating community rating timer:', error);
    return res.status(500).json({ error: 'Failed to update community rating timer setting.' });
  }
});

export default router;
