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
    <div className="relative overflow-hidden rounded-xl bg-surface border border-white/[0.06] p-5 md:p-6 my-6">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Festival Premiere & Submission Deadline Info */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-gold-400" /> Thirai+ Film Festival 2027
            </span>

            {/* Submissions Closing Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Calendar className="w-3 h-3 text-amber-400" /> Submissions Close: Nov 30, 2026
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Grand Festival Premiere: <span className="text-gold-400 font-serif">January 16, 2027</span>
          </h3>

          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed font-normal">
            Worldwide short film gala, red carpet screenings, and official award ceremony. Submissions are open until <strong className="text-zinc-200">November 30, 2026</strong> ({submissionsDaysLeft} days remaining).
          </p>
        </div>

        {/* Right Side: Live Countdown Timer Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="grid grid-cols-4 gap-2 text-center">
            
            {/* Days */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-lg p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono leading-none">
                {timeLeft.days}
              </span>
              <span className="block text-[9px] uppercase font-semibold text-zinc-400 tracking-wider mt-1.5">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-lg p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-semibold text-zinc-400 tracking-wider mt-1.5">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-lg p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-semibold text-zinc-400 tracking-wider mt-1.5">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-[#10131b] border border-white/[0.06] rounded-lg p-2.5 sm:p-3 min-w-[58px] sm:min-w-[68px]">
              <span className="block text-xl sm:text-2xl font-bold text-gold-400 font-mono leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] uppercase font-semibold text-zinc-400 tracking-wider mt-1.5">
                Secs
              </span>
            </div>
          </div>

          {/* Direct CTA */}
          <Link
            href="/upload"
            className="gold-btn px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95 transition-opacity text-black shrink-0"
          >
            <Film className="w-3.5 h-3.5" /> Submit Film <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
