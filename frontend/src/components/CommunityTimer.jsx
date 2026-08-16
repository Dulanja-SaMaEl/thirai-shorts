"use client";

import { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import api from '../lib/api';

export default function CommunityTimer() {
  const [timerSetting, setTimerSetting] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetchTimerStatus();
    const interval = setInterval(fetchTimerStatus, 30000); // Check status every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchTimerStatus = async () => {
    try {
      const res = await api.get('/vote/timer-status');
      if (res.data.success) {
        setTimerSetting(res.data.setting);
      }
    } catch (err) {
      console.error('Failed to fetch timer status:', err);
    }
  };

  useEffect(() => {
    if (!timerSetting?.is_active || !timerSetting?.end_time) return;

    const timer = setInterval(() => {
      const target = new Date(timerSetting.end_time).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setIsExpired(false);
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSetting]);

  if (!timerSetting?.is_active) {
    return null; // Rating event disabled by admin
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-gold-500/20 to-orange-500/10 border border-gold-500/40 rounded-2xl p-4 my-6 shadow-gold-glow flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 flex items-center justify-center shadow-gold-glow">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            Limited Time Community Choice Event Active!
          </h4>
          <p className="text-xs text-zinc-300">
            Cast your vote for your favorite short films. Anti-spam email verification is enforced.
          </p>
        </div>
      </div>

      {/* Countdown Timer Display */}
      <div className="flex items-center gap-3 bg-black/80 border border-gold-500/30 px-5 py-2.5 rounded-xl">
        <Clock className="w-4 h-4 text-gold-400" />
        {isExpired ? (
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Voting Ended</span>
        ) : (
          <div className="flex items-center gap-2 font-mono text-base font-extrabold text-gold-300">
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Hrs</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Min</span>
            </div>
            <span>:</span>
            <div className="flex flex-col items-center">
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Sec</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
