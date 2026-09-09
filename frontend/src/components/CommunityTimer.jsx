"use client";

import { useState, useEffect } from 'react';
import { Clock, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function CommunityTimer() {
  const [timerSetting, setTimerSetting] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [countdownMode, setCountdownMode] = useState('none'); // 'upcoming' | 'live' | 'ended'

  useEffect(() => {
    fetchTimerStatus();
    const interval = setInterval(fetchTimerStatus, 20000); // Check status every 20s
    return () => clearInterval(interval);
  }, []);

  const fetchTimerStatus = async () => {
    try {
      const res = await api.get('/vote/timer-status');
      if (res.data.success && res.data.setting) {
        setTimerSetting(res.data.setting);
      }
    } catch (err) {
      console.warn('Failed to fetch timer status:', err);
    }
  };

  useEffect(() => {
    if (!timerSetting?.is_active) {
      setCountdownMode('none');
      return;
    }

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const startTime = timerSetting.start_time ? new Date(timerSetting.start_time).getTime() : null;
      const endTime = timerSetting.end_time ? new Date(timerSetting.end_time).getTime() : null;

      // 1. Scheduled / Upcoming Mode (now < startTime)
      if (startTime && now < startTime) {
        const diff = startTime - now;
        setCountdownMode('upcoming');
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
        return;
      }

      // 2. Ended Mode (endTime passed)
      if (endTime && now >= endTime) {
        setCountdownMode('ended');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // 3. Live Mode (voting is currently open)
      if (endTime) {
        const diff = endTime - now;
        if (diff <= 0) {
          setCountdownMode('ended');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setCountdownMode('live');
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        }
      } else {
        // Active indefinitely without explicit end time
        setCountdownMode('live');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [timerSetting]);

  if (!timerSetting?.is_active || countdownMode === 'none') {
    return null; // Rating event disabled by admin
  }

  const title = timerSetting.title || 'Festival Choice Community Voting';

  return (
    <div className={`w-full border rounded-2xl p-4 md:p-5 my-6 shadow-gold-glow flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
      countdownMode === 'upcoming'
        ? 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border-indigo-500/40'
        : countdownMode === 'ended'
        ? 'bg-gradient-to-r from-zinc-900/80 via-zinc-850 to-zinc-900/80 border-zinc-700/60'
        : 'bg-gradient-to-r from-amber-500/10 via-gold-500/20 to-orange-500/10 border-gold-500/40'
    }`}>
      {/* Event Details */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gold-gradient p-0.5 flex items-center justify-center shadow-gold-glow shrink-0">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            {countdownMode === 'upcoming' ? (
              <Calendar className="w-5 h-5 text-indigo-400 animate-pulse" />
            ) : countdownMode === 'ended' ? (
              <CheckCircle2 className="w-5 h-5 text-zinc-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
            )}
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-extrabold text-white">
              {title}
            </h4>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              countdownMode === 'upcoming'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : countdownMode === 'ended'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {countdownMode === 'upcoming' ? '● SCHEDULED / UPCOMING' : countdownMode === 'ended' ? '○ VOTING CONCLUDED' : '● LIVE NOW'}
            </span>
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            {countdownMode === 'upcoming'
              ? `Community rating will open on ${new Date(timerSetting.start_time).toLocaleString()}. Get ready to vote!`
              : countdownMode === 'ended'
              ? 'Public voting has concluded. Final audience ratings are being verified and tallied.'
              : 'Cast your 1-10 rating for your favorite festival short films. Anti-spam email verification enforced.'}
          </p>
        </div>
      </div>

      {/* Countdown Timer Display */}
      <div className="flex items-center gap-3 bg-black/85 border border-gold-500/30 px-5 py-3 rounded-2xl shrink-0 shadow-lg">
        <Clock className={`w-4 h-4 ${countdownMode === 'upcoming' ? 'text-indigo-400' : countdownMode === 'ended' ? 'text-zinc-500' : 'text-gold-400'}`} />
        
        {countdownMode === 'ended' ? (
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Voting Ended</span>
        ) : (
          <div className="flex items-center gap-2 font-mono text-base font-extrabold text-gold-300">
            {timeLeft.days > 0 && (
              <>
                <div className="flex flex-col items-center">
                  <span className="text-lg leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[9px] text-zinc-500 font-sans uppercase">Days</span>
                </div>
                <span className="text-zinc-600">:</span>
              </>
            )}
            <div className="flex flex-col items-center">
              <span className="text-lg leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Hrs</span>
            </div>
            <span className="text-zinc-600">:</span>
            <div className="flex flex-col items-center">
              <span className="text-lg leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Min</span>
            </div>
            <span className="text-zinc-600">:</span>
            <div className="flex flex-col items-center">
              <span className="text-lg leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 font-sans uppercase">Sec</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
