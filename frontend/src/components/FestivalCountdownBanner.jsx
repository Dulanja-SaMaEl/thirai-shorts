"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Film, Sparkles, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

export default function FestivalCountdownBanner() {
  // Target Festival Date: January 16, 2027
  const festivalTargetDate = new Date('2027-01-16T00:00:00Z').getTime();

  // Submissions Closing Date: November 30, 2026
  const submissionsClosingDate = new Date('2026-11-30T23:59:59Z').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [submissionsDaysLeft, setSubmissionsDaysLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();

      // Calculate festival date countdown
      const diff = festivalTargetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }

      // Calculate submissions days left
      const subDiff = submissionsClosingDate - now;
      if (subDiff > 0) {
        setSubmissionsDaysLeft(Math.floor(subDiff / (1000 * 60 * 60 * 24)));
      } else {
        setSubmissionsDaysLeft(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border border-gold-500/40 p-5 md:p-6 shadow-gold-glow my-6">
      {/* Background ambient gold aura */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Festival Premiere & Submission Deadline Info */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/50 text-gold-300 text-xs font-black uppercase tracking-wider shadow-gold-glow">
              <Award className="w-3.5 h-3.5 text-gold-400" /> Thirai+ Film Festival 2027
            </span>

            {/* Submissions Closing Pill */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Calendar className="w-3 h-3 text-amber-400" /> Submissions Close: Nov 30, 2026
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Grand Festival Premiere: <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-500 font-serif">January 16, 2027</span>
          </h3>

          <p className="text-xs text-zinc-400 max-w-lg">
            Worldwide short film gala, red carpet screenings, and official award ceremony. Submissions are open until <strong className="text-zinc-200">November 30, 2026</strong> ({submissionsDaysLeft} days remaining).
          </p>
        </div>

        {/* Right Side: Live Countdown Timer Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="grid grid-cols-4 gap-2 text-center">
            
            {/* Days */}
            <div className="bg-black/80 border border-gold-500/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] shadow-gold-glow">
              <span className="block text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {timeLeft.days}
              </span>
              <span className="block text-[9px] uppercase font-bold text-gold-400 tracking-wider mt-1">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="bg-black/80 border border-gold-500/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] shadow-gold-glow">
              <span className="block text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-bold text-gold-400 tracking-wider mt-1">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-black/80 border border-gold-500/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] shadow-gold-glow">
              <span className="block text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-bold text-gold-400 tracking-wider mt-1">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-black/80 border border-gold-500/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px] sm:min-w-[72px] shadow-gold-glow">
              <span className="block text-2xl sm:text-3xl font-black text-gold-300 font-mono leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-bold text-gold-400 tracking-wider mt-1">
                Secs
              </span>
            </div>
          </div>

          {/* Direct CTA */}
          <Link
            href="/upload"
            className="gold-btn px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow hover:scale-105 active:scale-95 transition-all text-black shrink-0"
          >
            <Film className="w-3.5 h-3.5" /> Submit Film <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
