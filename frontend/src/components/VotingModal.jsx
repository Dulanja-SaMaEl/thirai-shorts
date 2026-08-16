"use client";

import { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, Star, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import api from '../lib/api';

export default function VotingModal({ movie, onClose }) {
  const [step, setStep] = useState(1); // 1: Email & Rating, 2: OTP Verification, 3: Success
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(8);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/vote/request-otp', {
        movie_id: movie.id,
        voter_email: email,
        rating
      });

      if (res.data.success) {
        if (res.data.dev_otp) {
          setDevOtpHint(res.data.dev_otp);
        }
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit vote request.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/vote/verify-otp', {
        movie_id: movie.id,
        voter_email: email,
        otp_code: otpCode
      });

      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-surface-card border border-gold-500/40 rounded-2xl p-6 shadow-gold-glow-lg">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Input Email and 1-10 Rating */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Community Rating</h3>
                <p className="text-xs text-zinc-400">Rate "{movie.title}"</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Score Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Select Score (1 to 10)</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      rating === num
                        ? 'bg-gold-gradient text-black border-gold-400 shadow-gold-glow'
                        : 'bg-black/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Voter Email */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Your Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voter@example.com"
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                * Anti-Spam: Disposable emails (temp-mail, 10minutemail, etc.) are blocked.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-btn py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? 'Validating Email...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enter OTP Code</h3>
                <p className="text-xs text-zinc-400">Sent code to: {email}</p>
              </div>
            </div>

            {devOtpHint && (
              <div className="p-2.5 mb-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs">
                🔑 Demo Auto-Code: <strong className="font-mono text-white tracking-widest">{devOtpHint}</strong>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-300 mb-2">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 px-4 text-center font-mono text-lg tracking-widest text-gold-300 focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-btn py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Verifying...' : 'Confirm Vote'}
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === 3 && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-1">Vote Successfully Verified!</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Thank you! Your rating of <strong className="text-gold-400">{rating} / 10</strong> has been counted towards "{movie.title}".
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
