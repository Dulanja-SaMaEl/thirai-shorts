import express from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

/**
 * @route POST /api/stripe/create-checkout-session
 * @desc Create Stripe payment session for movie submission fee ($25.00)
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { movie_title, uploader_email } = req.body;

    const submissionFeeCents = parseInt(process.env.SUBMISSION_FEE_CENTS || '2500', 10); // $25.00 USD

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: uploader_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Thirai+ Film Festival Submission Fee`,
              description: `Entry fee for short film: "${movie_title || 'Untitled Short'}"`,
            },
            unit_amount: submissionFeeCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upload?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upload?canceled=true`,
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return res.status(500).json({ error: 'Failed to create payment checkout session.' });
  }
});

/**
 * @route POST /api/stripe/webhook
 * @desc Handle Stripe webhook for payment confirmation
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err) {
    console.error('Stripe Webhook Signature Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Log payment record in Supabase
    await supabaseAdmin
      .from('payments')
      .insert([{
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_cents: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        payer_email: session.customer_details?.email || session.customer_email
      }]);
  }

  res.json({ received: true });
});

export default router;
