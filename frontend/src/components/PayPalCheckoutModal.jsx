"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, X,
  ArrowRight, Lock, Loader2, Info, Copy, Check
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SANDBOX_CLIENT_ID = 'AVA-3ilu07V-E_gBmP5_3dgBvcoagmEqvGVK-ZS9IJbJSpm_lXvnZZYdhW7afqMTg029PrI-I3CcnfWi';

export default function PayPalCheckoutModal({
  isOpen,
  onClose,
  item = null, // { id: 'yearly', name: 'Viewer Cinema Pass (Annual)', price_usd: 39.99, price_lkr_estimate: 12400, features: [...] }
  type = 'package', // 'package' | 'submission'
  movieData = null, // { id, title }
  onSuccess,
}) {
  const { user, refreshUser } = useAuth();
  const [clientId, setClientId] = useState(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || DEFAULT_SANDBOX_CLIENT_ID
  );
  const [sdkLoading, setSdkLoading] = useState(true);
  const [sdkError, setSdkError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captureDetails, setCaptureDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const paypalContainerRef = useRef(null);

  // Fetch PayPal config from backend if env var is not present
  useEffect(() => {
    let isMounted = true;
    api.get('/paypal/config')
      .then(res => {
        if (isMounted && res.data?.clientId) {
          setClientId(res.data.clientId);
        }
      })
      .catch(err => {
        console.warn('Could not fetch PayPal config, using fallback:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setCaptureDetails(null);
      setErrorMessage('');
      setIsProcessing(false);
    }
  }, [isOpen, item?.id]);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  const handleCopyBuyer = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('sb-vhxn453129032@personal.example.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleCopyCard = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText('4035170000000000');
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    }
  };

  // Load PayPal SDK and render Smart Buttons
  useEffect(() => {
    if (!isOpen || isSuccess || !clientId) return;

    let isCancelled = false;
    setSdkLoading(true);
    setSdkError('');

    const targetSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&disable-funding=card,credit`;

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        const scriptId = 'paypal-sdk-script';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) {
          if (window.paypal && existingScript.getAttribute('src') === targetSrc) {
            resolve(window.paypal);
            return;
          }
          existingScript.remove();
          if (window.paypal) delete window.paypal;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.setAttribute('data-client-id', clientId);
        script.src = targetSrc;
        script.async = true;
        script.onload = () => resolve(window.paypal);
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    loadScript()
      .then((paypal) => {
        if (isCancelled || !paypalContainerRef.current) return;
        setSdkLoading(false);

        // Clear any previous rendered buttons
        paypalContainerRef.current.innerHTML = '';

        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 46,
          },
          createOrder: (data, actions) => {
            setErrorMessage('');
            try {
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    description: `${itemName}`.substring(0, 127),
                    amount: {
                      currency_code: 'USD',
                      value: Number(priceUsd).toFixed(2),
                    },
                  },
                ],
                application_context: {
                  brand_name: 'Thirai Plus',
                  shipping_preference: 'NO_SHIPPING',
                  user_action: 'PAY_NOW',
                  landing_page: 'NO_PREFERENCE',  // Standard flow: shows login + "Pay with Debit or Credit Card" link beneath
                },
              });
            } catch (err) {
              const msg = err.message || 'Error creating PayPal order.';
              setErrorMessage(msg);
              throw err;
            }
          },
          onApprove: async (data, actions) => {
            setIsProcessing(true);
            setErrorMessage('');
            try {
              let captureId = data.orderID;
              if (actions.order && typeof actions.order.capture === 'function') {
                const captured = await actions.order.capture();
                const capUnit = captured?.purchase_units?.[0]?.payments?.captures?.[0];
                if (capUnit?.id) captureId = capUnit.id;
              }

              const capturePayload = {
                orderId: data.orderID,
                type,
                package_id: item?.id,
                movie_id: movieData?.id,
              };

              const res = await api.post('/paypal/capture-order', capturePayload);

              if (res.data?.success) {
                setIsSuccess(true);
                setCaptureDetails({
                  orderId: data.orderID,
                  captureId: res.data.captureId || captureId,
                  message: res.data.message || 'Payment confirmed!',
                });
                await refreshUser();
                if (onSuccess) onSuccess(res.data);
              } else {
                setErrorMessage(res.data?.error || 'Payment capture failed.');
              }
            } catch (err) {
              const msg = err.response?.data?.error || err.message || 'Error processing payment capture.';
              setErrorMessage(msg);
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (err) => {
            console.error('PayPal checkout error:', err);
            setErrorMessage('PayPal encountered an error. Please try again or verify your sandbox test account.');
          },
          onCancel: () => {
            console.log('PayPal checkout was cancelled by the user.');
          },
        }).render(paypalContainerRef.current);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('PayPal SDK loading error:', err);
          setSdkError('Unable to load PayPal Checkout. Please check your internet connection.');
          setSdkLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, isSuccess, clientId, item?.id, type, movieData?.title, movieData?.id]);

  if (!isOpen) return null;

  const priceUsd = item?.price_usd !== undefined ? item.price_usd : 4.99;
  const priceLkr = item?.price_lkr_estimate || Math.round(priceUsd * 310);
  const itemName = item?.name || (type === 'submission' ? 'Film Submission Entry Fee' : 'Festival VIP Pass');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0B0D13] border-2 border-gold-500/50 rounded-3xl p-6 sm:p-8 shadow-gold-glow-lg text-white space-y-6 overflow-hidden my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 transition-colors z-10"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="text-center space-y-5 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-gold-400 tracking-wider font-bold">
                  Transaction Completed
                </span>
                <h3 className="text-2xl font-black text-white">Payment Confirmed!</h3>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  {captureDetails?.message || `Your payment for "${itemName}" has been successfully processed.`}
                </p>
              </div>

              <div className="bg-[#121622] border border-white/[0.08] rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Product:</span>
                  <span className="text-white font-semibold">{itemName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-400 font-bold">${priceUsd.toFixed(2)} USD</span>
                </div>
                {captureDetails?.captureId && (
                  <div className="flex justify-between text-zinc-400 truncate gap-2">
                    <span>Capture ID:</span>
                    <span className="text-zinc-300 truncate">{captureDetails.captureId}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">PAID & ACTIVE</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full gold-btn py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-gold-glow flex items-center justify-center gap-2"
              >
                <span>Continue to Festival</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Checkout Screen */
            <div className="space-y-6">
              
              {/* Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[11px] font-bold uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" /> Secure PayPal Checkout
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {itemName}
                </h3>
                <p className="text-xs text-zinc-400">
                  Complete your order securely with PayPal balance, linked cards, or credit.
                </p>
              </div>

              {/* Price & Plan Summary Card */}
              <div className="bg-[#121622] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Due</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      ${priceUsd.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">USD</span>
                  </div>
                  <span className="text-[11px] text-gold-400/90 font-mono">
                    ≈ Rs. {priceLkr.toLocaleString()} LKR
                  </span>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[10px] font-bold uppercase">
                    {item?.billing_period === 'yearly' ? 'Annual Pass' : (item?.billing_period === 'monthly' ? 'Monthly Pass' : 'Standard Entry')}
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 justify-end">
                    <Lock className="w-3 h-3 text-emerald-400" /> 256-bit Encrypted
                  </div>
                </div>
              </div>

              {/* Guest Checkout How-To Guide */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0F131C] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-gold-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400">Paying Without a PayPal Account</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { step: '1', label: 'Click the yellow PayPal button below' },
                    { step: '2', label: 'In the popup, scroll down past "Log In" and "Sign Up" to find the link:' },
                    { step: '3', label: 'Enter your Visa / Mastercard details and pay as a guest — no account needed' },
                  ].map(({ step, label }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-black flex items-center justify-center mt-0.5">{step}</span>
                      <span className="text-[11px] text-zinc-300 leading-relaxed">{label}
                        {step === '2' && (
                          <span className="block mt-1 font-bold text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-lg px-2 py-1 text-[11px]">
                            💳 &quot;Pay with Debit or Credit Card&quot;
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sandbox Test Credentials */}
              <div className="p-3.5 rounded-2xl bg-amber-500/[0.07] border border-amber-500/25 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" /> Sandbox Test Credentials
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">Sandbox Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Mock Visa Card */}
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.08] space-y-1">
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">Mock Visa Card (Guest)</span>
                    <span className="font-mono text-[12px] text-white font-bold tracking-widest block">4035 1700 0000 0000</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Exp: 12/28 · CVV: 123 · Zip: 95131</span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="mt-1.5 w-full px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-amber-500/20"
                    >
                      {copiedCard ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCard ? 'Copied!' : 'Copy Card Number'}</span>
                    </button>
                  </div>

                  {/* Mock PayPal Account */}
                  <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.08] space-y-1">
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">Mock PayPal Login</span>
                    <span className="font-mono text-[11px] text-white font-semibold block break-all leading-relaxed">
                      sb-vhxn453129032@personal.example.com
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-mono">Password: see developer.paypal.com</span>
                    <button
                      type="button"
                      onClick={handleCopyBuyer}
                      className="mt-1.5 w-full px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-amber-500/20"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-amber-200/60 leading-relaxed">
                  ⚠️ Real bank cards are rejected in Sandbox. Use the mock Visa above. In live production, all real Visa & Mastercard cards work.
                </p>
              </div>

              {/* Accepted Payment Methods */}
              <div className="bg-[#121622] border border-white/[0.08] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-medium">Accepted via PayPal:</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">VISA</span>
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">MC</span>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">AMEX</span>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">PAYPAL</span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {sdkError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{sdkError}</span>
                </div>
              )}

              {/* Loading State or PayPal Button Container */}
              <div className="min-h-[120px] flex flex-col justify-center">
                {sdkLoading && (
                  <div className="flex flex-col items-center justify-center py-6 text-zinc-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
                    <span className="text-xs">Initializing Secure Checkout Gateway...</span>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-6 text-zinc-300 space-y-2 bg-[#0F131C] rounded-2xl border border-white/[0.08]">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs font-semibold">Verifying & Capturing PayPal Transaction...</span>
                  </div>
                )}

                {/* PayPal Smart Buttons target container */}
                <div
                  ref={paypalContainerRef}
                  className={`w-full ${sdkLoading || isProcessing ? 'hidden' : 'block'}`}
                />
              </div>

              {/* Footer Trust Guarantee */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Buyer Protection Included
                </span>
                <span>Immediate Digital Activation</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
