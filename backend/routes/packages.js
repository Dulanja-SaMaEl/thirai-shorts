import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userStore } from '../config/userStore.js';
import { supabaseAdmin } from '../config/supabase.js';

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
  }
];

/**
 * @route GET /api/packages
 * @desc Get available subscription and token packages with USD & estimated LKR pricing
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    packages: PACKAGES,
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

    if (!package_id || !['monthly', 'yearly'].includes(package_id)) {
      return res.status(400).json({ error: 'Valid package_id (monthly or yearly) is required.' });
    }

    const selectedPkg = PACKAGES.find(p => p.id === package_id);
    const updatedUser = userStore.subscribeUser(userId, package_id);

    // Sync with Supabase DB if available
    try {
      const expiresAt = new Date();
      if (package_id === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
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
