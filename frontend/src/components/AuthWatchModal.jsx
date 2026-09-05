"use client";

import Link from 'next/link';
import { X, Lock, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export default function AuthWatchModal({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-surface-card border border-gold-500/40 rounded-3xl p-6 md:p-8 shadow-gold-glow-lg glass-panel space-y-6 text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-gold-500 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto">
          <div className="w-full h-full bg-black rounded-3xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-gold-400" />
          </div>
        </div>

        {/* Header & Movie Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest">
            Audience Authentication Required
          </span>
          <h2 className="text-xl font-extrabold text-white">
            Log In to Stream This Short Film
          </h2>
          <p className="text-xs text-zinc-300">
            You are attempting to watch <strong className="text-gold-300">"{movie.title}"</strong>. Full cinema streams are reserved for registered festival viewers.
          </p>
        </div>

        {/* 2 Free Tokens Registration Perk Banner */}
        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-left space-y-1">
          <div className="flex items-center gap-2 text-gold-300 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Get 2 Free Movie Tokens!</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Create a free account in 30 seconds and receive 2 viewing tokens to watch this movie and another short film for free.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Link
            href="/register"
            onClick={onClose}
            className="w-full gold-btn py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            Register & Claim 2 Free Tokens <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-500/60 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4 text-gold-400" /> Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
