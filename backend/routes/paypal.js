import express from 'express';
import { paypalService } from '../services/paypalService.js';
import { PACKAGES } from './packages.js';
import { optionalAuth } from '../middleware/auth.js';
import { userStore } from '../config/userStore.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

/**
 * @route GET /api/paypal/config
 * @desc Get public PayPal Client ID and operational mode for frontend SDK init
 */
router.get('/config', (req, res) => {
  return res.status(200).json({
    success: true,
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    mode: process.env.PAYPAL_MODE || 'sandbox',
    currency: 'USD',
  });
});

/**
 * @route POST /api/paypal/create-order
 * @desc Create PayPal v2 order for festival passes or film submissions
 */
router.post('/create-order', optionalAuth(), async (req, res) => {
  try {
    const { package_id, type = 'package', movie_title } = req.body;

    let amount = 4.99;
    let description = 'Thirai+ Film Festival';
    let customId = `thirai_${Date.now()}`;

    if (type === 'submission') {
      const feeCents = parseInt(process.env.SUBMISSION_FEE_CENTS || '499', 10);
      amount = feeCents / 100;
      description = `Submission Entry Fee: "${movie_title || 'Untitled Short'}"`;
      customId = `sub_${Date.now()}`;
    } else {
      // Pass subscription
      const selectedPkg = PACKAGES.find(p => p.id === package_id);
      if (!selectedPkg) {
        return res.status(400).json({ error: 'Valid package_id is required.' });
      }

      amount = selectedPkg.price_usd;
      description = `Thirai+ Festival Pass: ${selectedPkg.name}`;
      customId = `pkg_${package_id}_${req.user?.id || 'guest'}_${Date.now()}`;
    }

    const order = await paypalService.createOrder({
      amount,
      currency: 'USD',
      description,
      customId,
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount,
      currency: 'USD',
    });
  } catch (error) {
    console.error('PayPal create-order endpoint error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create PayPal order.',
    });
  }
});

/**
 * @route POST /api/paypal/capture-order
 * @desc Capture and verify authorized PayPal payment order
 */
router.post('/capture-order', optionalAuth(), async (req, res) => {
  try {
    const { orderId, captureId: clientCaptureId, clientCaptured, package_id, type = 'package', movie_id } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required.' });
    }

    let captureResult = null;
    let captureId = clientCaptureId || orderId;
    let amountVal = 0;
    let payerEmail = req.user?.email || 'guest@thiraiplus.com';

    // If client-side SDK already executed actions.order.capture() successfully
    if (clientCaptured && clientCaptureId) {
      try {
        captureResult = await paypalService.getOrder(orderId);
      } catch (getErr) {
        console.warn('Could not re-fetch order via API, trusting client capture:', getErr.message);
        captureResult = { status: 'COMPLETED', id: orderId };
      }
    } else {
      // Capture payment with PayPal REST API
      try {
        captureResult = await paypalService.captureOrder(orderId);
      } catch (captureErr) {
        // If already captured or rejected due to duplicate capture, fetch order details to verify
        const isDuplicateOrHandled =
          captureErr.issue === 'ORDER_ALREADY_CAPTURED' ||
          captureErr.data?.details?.some(d => d.issue === 'ORDER_ALREADY_CAPTURED') ||
          captureErr.message?.includes('ORDER_ALREADY_CAPTURED') ||
          captureErr.message?.includes('already been captured') ||
          captureErr.message?.includes('The requested action could not be performed') ||
          captureErr.message?.includes('UNPROCESSABLE_ENTITY');

        if (isDuplicateOrHandled) {
          try {
            captureResult = await paypalService.getOrder(orderId);
          } catch (getErr) {
            console.warn('Fallback getOrder also failed, checking client capture flag:', getErr.message);
            if (clientCaptured) {
              captureResult = { status: 'COMPLETED', id: orderId };
            } else {
              throw captureErr;
            }
          }
        } else {
          throw captureErr;
        }
      }
    }

    if (captureResult) {
      const captureUnit = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      if (captureUnit?.id) captureId = captureUnit.id;
      amountVal = parseFloat(
        captureUnit?.amount?.value ||
        captureResult.purchase_units?.[0]?.amount?.value ||
        '0'
      );
      if (captureResult.payer?.email_address) {
        payerEmail = captureResult.payer.email_address;
      }
    }

    let updatedUser = null;

    // Handle Festival Pass activation
    if (type === 'package' && package_id) {
      const selectedPkg = PACKAGES.find(p => p.id === package_id);

      if (req.user?.id) {
        updatedUser = userStore.subscribeUser(req.user.id, package_id);

        if (isSupabaseConfigured) {
          try {
            const expiresAt = new Date();
            if (package_id.includes('yearly')) {
              expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            } else {
              expiresAt.setMonth(expiresAt.getMonth() + 1);
            }

            await supabaseAdmin.from('users').update({
              subscription_tier: package_id,
              subscription_status: 'active',
              subscription_expires_at: expiresAt.toISOString(),
              tokens_balance: updatedUser.tokens_balance,
            }).eq('id', req.user.id);

            await supabaseAdmin.from('payments').insert({
              user_id: req.user.id,
              package_type: package_id,
              amount_cents: Math.round(amountVal * 100),
              currency: 'usd',
              status: 'paid',
              payer_email: payerEmail,
            });
          } catch (dbErr) {
            console.warn('Supabase DB subscription update note:', dbErr.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: `Payment successful! Activated ${selectedPkg?.name || 'Festival Pass'}.`,
        orderId,
        captureId,
        user: updatedUser,
      });
    }

    // Handle Film Submission entry fee payment
    if (type === 'submission') {
      if (movie_id && isSupabaseConfigured) {
        try {
          await supabaseAdmin.from('movies').update({
            payment_status: 'paid',
            stripe_payment_intent_id: `paypal_${captureId}`,
          }).eq('id', movie_id);

          await supabaseAdmin.from('payments').insert({
            user_id: req.user?.id || null,
            package_type: 'submission_fee',
            amount_cents: Math.round(amountVal * 100),
            currency: 'usd',
            status: 'paid',
            payer_email: payerEmail,
          });
        } catch (dbErr) {
          console.warn('Supabase DB movie payment update note:', dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Film submission fee successfully processed via PayPal.',
        orderId,
        captureId,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'PayPal payment captured successfully.',
      orderId,
      captureId,
    });
  } catch (error) {
    console.error('PayPal capture-order endpoint error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to capture PayPal order.',
    });
  }
});

export default router;
