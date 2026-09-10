import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userStore } from '../config/userStore.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

const USD_TO_LKR_RATE = 310; // Approx 1 USD = 310 LKR

export const PACKAGES = [
  {
    id: 'monthly',
    name: 'Monthly VIP Cinema Pass',
    price_usd: 4.99,
    price_lkr_estimate: 1550, // Approx. Rs. 1,550
    billing_period: 'monthly',
    badge: 'Popular',
    features: [
      'Unlimited short movie streaming',
      'Instant access to all festival official selections',
      'Ultra HD cinema video quality',
      'Community choice festival voting pass',
      'No token deductions during active month'
    ]
  },
  {
    id: 'yearly',
    name: 'Annual VIP Cinema Pass',
    price_usd: 39.99,
    price_lkr_estimate: 12400, // Approx. Rs. 12,400 (Save 33%)
    billing_period: 'yearly',
    badge: 'Best Value • Save 33%',
    features: [
      'Full 12-month unlimited movie access',
      'Priority access to Award Winner showcases',
      'Exclusive director statements & film press kits',
      'Grand Jury Choice community voting rights',
      'Save 33% compared to monthly pass'
    ]
  },
  {
    id: 'submitter_monthly',
    name: 'Filmmaker Submitter VIP (Monthly)',
    price_usd: 2.99,
    price_lkr_estimate: 930, // Approx. Rs. 930
    billing_period: 'monthly',
    badge: 'Exclusive Filmmaker Special',
    is_submitter_only: true,
    features: [
      'Exclusive filmmaker discount ($2.99/month)',
      'Unlimited short movie streaming (zero tokens deducted)',
      'Instant access to all festival selections',
      'Festival community jury voting privileges',
      'Official Film Submitter profile badge'
    ]
  },
  {
    id: 'submitter_yearly',
    name: 'Filmmaker Submitter VIP (Annual)',
    price_usd: 29.99,
    price_lkr_estimate: 9300, // Approx. Rs. 9,300
    billing_period: 'yearly',
    badge: 'Best Filmmaker Value • Save 50%',
    is_submitter_only: true,
    features: [
      'Full 12-month unlimited movie streaming ($29.99/year)',
      'Deepest festival discount for filmmakers',
      'Priority access to Award Winner showcases',
      'Grand Jury Choice community voting rights',
      'Director statements & behind-the-scenes press kits'
    ]
  }
];

/**
 * @route GET /api/packages
 * @desc Get available subscription and token packages with USD & estimated LKR pricing
 */
router.get('/', async (req, res) => {
  let packagesList = PACKAGES;

  if (isSupabaseConfigured) {
    try {
      const { data: dbPackages, error } = await supabaseAdmin
        .from('packages')
        .select('*')
        .eq('is_active', true);

      if (!error && dbPackages && dbPackages.length > 0) {
        packagesList = dbPackages.map(p => ({
          id: p.plan_id,
          name: p.name,
          price_usd: Number(p.price_usd),
          price_lkr_estimate: Number(p.estimated_price_lkr),
          billing_period: p.billing_cycle,
          badge: p.plan_id.includes('yearly') ? 'Best Value • Save 33%' : 'Popular',
          features: Array.isArray(p.features) ? p.features : []
        }));
      }
    } catch (e) {
      console.warn('Supabase packages fetch notice:', e.message);
    }
  }

  return res.status(200).json({
    success: true,
    packages: packagesList,
    exchange_rate: {
      base: 'USD',
      target: 'LKR',
      rate: USD_TO_LKR_RATE,
      note: 'Estimated Sri Lankan Rupee (LKR) amount calculated at current exchange rates.'
    }
  });
});

/**
 * @route POST /api/packages/subscribe
 * @desc Activate user subscription package
 */
router.post('/subscribe', requireAuth(), async (req, res) => {
  try {
    const { package_id } = req.body;
    const userId = req.user.id;

    const allowedPlans = ['monthly', 'yearly', 'submitter_monthly', 'submitter_yearly'];
    if (!package_id || !allowedPlans.includes(package_id)) {
      return res.status(400).json({ error: 'Valid package_id is required.' });
    }

    const selectedPkg = PACKAGES.find(p => p.id === package_id);
    const updatedUser = userStore.subscribeUser(userId, package_id);

    // Sync with Supabase DB if available
    if (isSupabaseConfigured) {
      try {
        const expiresAt = new Date();
        if (package_id.includes('yearly')) expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        else expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabaseAdmin.from('users').update({
          subscription_tier: package_id,
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString(),
          tokens_balance: updatedUser.tokens_balance
        }).eq('id', userId);

        await supabaseAdmin.from('payments').insert({
          user_id: userId,
          package_type: package_id,
          amount_cents: Math.round(selectedPkg.price_usd * 100),
          currency: 'usd',
          status: 'paid',
          payer_email: req.user.email
        });
      } catch (e) {
        console.warn('Supabase DB subscription update note:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${selectedPkg.name}! Enjoy unlimited short film streaming.`,
      user: updatedUser,
      package: selectedPkg
    });
  } catch (error) {
    console.error('Package subscription error:', error);
    return res.status(500).json({ error: 'Failed to process package subscription.' });
  }
});

export default router;
